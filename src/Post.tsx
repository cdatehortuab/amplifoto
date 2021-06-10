import { useState, useEffect } from 'react'
import { css } from '@emotion/css';
import { useParams } from 'react-router-dom';
import { API } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api-graphql'

import { getPost } from './graphql/queries';
import { GetPostQuery, Post as PostEntity } from './API';
import PostImage from './PostImage';

interface PostRouteParams {
  id: string,
}

export default function Post() {
  const [loading, updateLoading] = useState(true);
  const [post, updatePost] = useState<PostEntity | null>(null);
  const { id } = useParams<PostRouteParams>()
  useEffect(() => {
    async function fetchPost() {
      try {
        const postData = await API.graphql({
          query: getPost, variables: { id }
        }) as GraphQLResult<GetPostQuery>;
        const currentPost = postData.data?.getPost
        if (currentPost) {
          updatePost(currentPost);
        }

        updateLoading(false);
      } catch (err) {
        console.log('error: ', err)
      }
    }

    fetchPost()
  }, [id])
  
  if (loading) return <h3>Loading...</h3>

  if (!post) return null;

  console.log('post: ', post)
  return (
    <div className={postContainer}>
      <div className={ownerContainer}>
        <div className={avatarPlaceholder}>
          <img src={`https://eu.ui-avatars.com/api/?name=${post.owner}`} alt={`${post.owner} avatar`}/>
        </div> 
        <h2>{post.owner}</h2>
        <h4>{post.location}</h4>
      </div>
        <h3 className={postTitleStyle}>{post.name}</h3>
        <p>{post.description}</p>
        <PostImage post={post} className={imageStyle} />
    </div>
  )
}

const imageStyle = css`
  max-width: 500px;
  @media (max-width: 500px) {
    width: 100%;
  }
`

const ownerContainer = css`
  border-bottom: 1px solid #dedede;
  h2 { 
    display: inline-block;
    margin-left: 20px;
    color: #152939;
  }
  h4 {
    font-style: italic;
    margin-top: 0px;
  }
`

const avatarPlaceholder = css`
  width: 20px;
  height: 30px;
  padding-top: 10px;
  display: inline-block;
  img {
    margin-top: 5px;
    width: 100%;
    border: 1px solid #dedede;
    border-radius: 20px;
  }
`
const postTitleStyle = css`
  margin: 15px 0px;
  color: #152939;
`

const postContainer = css`
  margin-top: 20px;
  border-radius: 4px;
  padding: 1px 20px 20px 20px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  :hover {
    border-color: #0070f3;
  }
`