import { memo, useEffect, useState } from "react"
import { Storage } from 'aws-amplify';
import { CustomPlaceholder } from 'react-placeholder-image';

interface IPostImageProps {
  post: {
    name: string,
    image?: string | null,
  },
  className?: string,
}

function PostImage({ post, className }: IPostImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function updateImageUrl() {
      if (!post.image) return;

      const imageKey = await Storage.get(post.image) as string;
      setImageUrl(imageKey);
    }

    updateImageUrl();
  }, [post.image]);

  return imageUrl !== null ? (
    <img alt={post.name} src={imageUrl || ''} className={className} />
  ) : (
    <CustomPlaceholder
      width={400}
      height={200}
      backgroundColor="#123456"
      textColor="#ffffff"
      text="No Image Available"
      className={className}
    />
  );
}

export default memo(PostImage);
