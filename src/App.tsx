import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { API, Auth } from 'aws-amplify';
import { css } from '@emotion/css';
import { GraphQLResult } from '@aws-amplify/api-graphql'
import { CognitoUser } from 'amazon-cognito-identity-js';

import { listPosts } from './graphql/queries';
import { Post as PostEntity, ListPostsQuery } from './API';

import Posts from './Posts';
import Post from './Post';
import Header from './Header';
import CreatePost from './CreatePost';
import Button from './Button';

function Router() {
  /* create a couple of pieces of initial state */
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [posts, setPosts] = useState<PostEntity[]>(() =>[]);

  const myPosts = useMemo(() => posts.filter((post) => post.owner === user?.getUsername()), [posts, user])

  const displayCreate = useCallback(() => setShowCreate(true), []);
  const hideCreate = useCallback(() => setShowCreate(false), []);

  const handleSuccessCreate = useCallback((post?: PostEntity | null) => {
    if (post) {
      setPosts((currentPosts) => [...currentPosts, post]);
    }
    hideCreate();
  }, [hideCreate]);


  /* update user when component loads */
  useEffect(() => {
    async function updateUser() {
      setUser(await Auth.currentAuthenticatedUser());
    }

    updateUser();
  }, []);

  /* fetch posts when component loads */
  useEffect(() => {
    async function fetchPosts() {
      /* query the API, ask for 100 items */
      let postData = await API.graphql({ query: listPosts, variables: { limit: 100 }}) as GraphQLResult<ListPostsQuery>;
      let postsArray = postData.data?.listPosts?.items?.filter((post) => !!post) as (PostEntity[] | undefined);

      if (postsArray) {
        /* update the posts array in the local state */
        setPosts(postsArray);
      }
    }
    fetchPosts();
  }, []);

  return (
    <>
      <HashRouter>
        <div className={contentStyle}>
          <Header />
          <hr className={dividerStyle} />
          <Button title="New Post" onClick={displayCreate} />
          <Switch>
            <Route exact path="/" >
              <Posts posts={posts} />
            </Route>
            <Route path="/post/:id" >
              <Post />
            </Route>
            <Route exact path="/myposts" >
              <Posts posts={myPosts} />
            </Route>
          </Switch>
        </div>
        <AmplifySignOut />
      </HashRouter>
      {showCreate && (
        <CreatePost
          onSuccess={handleSuccessCreate}
          onCancel={hideCreate}
        />
      )}
    </>
  );
}

const dividerStyle = css`
  margin-top: 15px;
`

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
`

export default withAuthenticator(memo(Router));