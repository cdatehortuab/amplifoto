import { memo, useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api-graphql'
import { withAuthenticator } from '@aws-amplify/ui-react'

import { listPosts } from './graphql/queries'
import { ListPostsQuery } from './API';

interface Post {
  id: string,
  name: string,
  location: string,
}

function App() {
  const [posts, setPosts] = useState<Post[]>(() => []);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const result = (await API.graphql({ query: listPosts })) as GraphQLResult<ListPostsQuery>;
        const items = result.data?.listPosts?.items as Post[];
        if (items) {
          setPosts(items);
        }
      } catch (error) {
        console.error('fetchPosts error', error, { error });
      }
    }

    async function checkUser() {
      const user = await Auth.currentAuthenticatedUser();
      setCurrentUser(user.username);
      console.log('user: ', user);
      console.log('user attributes: ', user.attributes);
    }

    fetchPosts();
    checkUser();
  }, []);

  return (
    <div>
      <h1>Amplifoto</h1>
      Hello, {currentUser}
      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.name}</h3>
          <p>{post.location}</p>
        </div>
      ))}
    </div>
  );
}

export default withAuthenticator(memo(App));
