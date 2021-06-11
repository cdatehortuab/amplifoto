import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import Amplify, { DataStore, syncExpression, Auth } from 'aws-amplify';
import { css } from '@emotion/css';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql'
import { CognitoUser } from 'amazon-cognito-identity-js';

import { Post, PostStatus } from './models';

import Posts from './Posts';
import SinglePost from './SinglePost';
import Header from './Header';
import CreatePost from './CreatePost';
import Button from './Button';

DataStore.configure({
  syncExpressions: [
    syncExpression(Post, () => (post) => post.status('eq', PostStatus.ACTIVE))
  ]
})

function Router() {
  /* create a couple of pieces of initial state */
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [posts, setPosts] = useState<Post[]>(() =>[]);

  const myPosts = useMemo(() => posts.filter((post) => post.owner === user?.getUsername()), [posts, user])

  const displayCreate = useCallback(() => setShowCreate(true), []);
  const hideCreate = useCallback(() => setShowCreate(false), []);

  const handleSuccessCreate = useCallback((post?: Post | null) => {
    if (post) {
      setPosts((currentPosts) => [...currentPosts, post]);
    }
    hideCreate();
  }, [hideCreate]);


  /* update user and fetch posts when component loads */
  useEffect(() => {
    async function updateUserAndFetchPosts() {
      const user = await Auth.currentAuthenticatedUser();
      let authType = GRAPHQL_AUTH_MODE.API_KEY;
      if (user) {
        authType = GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS;
        setUser(user);
      }
      Amplify.configure({
        aws_appsync_authenticationType: authType,
      });

      /* query the DataStore */
      let postsArray = await DataStore.query(Post);

      console.log('POST DATA FROM LOCAL: ');
      console.log(postsArray);
      /* update the posts array in the local state */
      setPosts(postsArray);
    }
    updateUserAndFetchPosts();
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
              <SinglePost />
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
          user={user}
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