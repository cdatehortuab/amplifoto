import { memo } from 'react'
import { css } from '@emotion/css';
import { Link } from 'react-router-dom';

import { Post } from './models';
import PostImage from './PostImage';

interface IPostsProps {
  posts: Post[]
}

function Posts({
  posts = []
}: IPostsProps) {
  return (
    <>
      <h1 className={sectionTitleStyle}>Posts</h1>
      {posts.map((post) => (
        <Link to={`/post/${post.id}`} className={linkStyle} key={post.id}>
          <div key={post.id} className={postContainer}>
            <div className={ownerContainer}>
              <div className={avatarPlaceholder}>
                <img src={`https://eu.ui-avatars.com/api/?name=${post.owner}`} alt={`${post.owner} avatar`} />
              </div>
              <h2>{post.owner}</h2>
            </div>
            <h3 className={postTitleStyle}>{post.name}</h3>
            <PostImage className={imageStyle} post={post} />
          </div>
        </Link>
      ))}
    </>
  )
}

const postTitleStyle = css`
  margin: 15px 0px;
  color: #152939;
`

const linkStyle = css`
  text-decoration: none;
`

const postContainer = css`
  border-radius: 4px;
  padding: 1px 20px 20px 20px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.15);
  :hover {
    border-color: #152939;
  }
`

const ownerContainer = css`
  border-bottom: 1px solid #dedede;
  h2 { 
    display: inline-block;
    margin-left: 20px;
    color: #152939;
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

const imageStyle = css`
  width: 100%;
  max-width: 400px;
  border-radius: 4px;
`

const sectionTitleStyle = css `
  font-family:'Amazon Ember', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  color: #152939;
  
`
export default memo(Posts);
