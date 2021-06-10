import { memo, useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api-graphql'

import { listPosts } from './graphql/queries'
import { ListPostsQuery } from './API';

interface Post {
  id: string,
  name: string,
  location: string,
}

function App() {
  const [posts, setPosts] = useState<Post[]>(() => []);

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

    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Amplifoto</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.name}</h3>
          <p>{post.location}</p>
        </div>
      ))}
    </div>
  );
}

export default memo(App);
