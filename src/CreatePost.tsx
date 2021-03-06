import { ChangeEventHandler, useState, useCallback } from 'react';
import { css } from '@emotion/css';
import { v4 as uuid } from 'uuid';
import Amplify, { Storage, Predictions, DataStore, Analytics } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import { CognitoUser } from 'amazon-cognito-identity-js';

import Button from './Button';
import { Post, PostStatus } from './models';

Amplify.addPluggable(new AmazonAIPredictionsProvider());

/* Initial state to hold form input, saving state */
const initialState = {
  name: '',
  description: '',
  image: {},
  file: '',
  location: '',
  saving: false
};

interface IImage {
  name?: string,
  fileInfo?: File,
}

interface IFormState {
  name: string,
  description: string,
  image: IImage,
  file: string,
  location: string,
  saving: boolean
}

interface ICreatePostProps {
  onSuccess: (post?: Post | null) => void,
  onCancel: () => void,
  user?: CognitoUser | null,
}

export default function CreatePost({
  onSuccess, onCancel, user = null,
}: ICreatePostProps) {
  /* 1. Create local state with useState hook */
  const [formState, updateFormState] = useState<IFormState>(initialState)

  /* 2. onChangeText handler updates the form state when a user types int a form field */
  const onChangeText: ChangeEventHandler = useCallback((e) => {
    e.persist();
    const target = e.target as HTMLInputElement;
    updateFormState(currentState => ({ ...currentState, [target.name]: target.value }));
  }, []);

  /* 3. onChangeFile hanlder will be fired when a user uploads a file  */
  const onChangeFile: ChangeEventHandler = useCallback((e) => {
    e.persist();
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    const image = { fileInfo: file, name: `${file.name}_${uuid()}`}
    console.log("image is: " + image.name)
    updateFormState(currentState => ({ ...currentState, file: URL.createObjectURL(file), image }))
  }, []);

  /* 4. Save the post  */
  const save = useCallback(async () => {
    try {
      const { name, description, location, image } = formState;
      if (!name || !description || !location || !image.name) return;
      updateFormState(currentState => ({ ...currentState, saving: true }));
      await Storage.put(image.name, image.fileInfo);
      /* -- PREDICTIONS -- */
          console.log('asking for predictions');
          const predicted = await Predictions.identify({
            labels: {
                source: {
                    key: image.name
                },
                type: "ALL"
              }
            });
          console.log('predicted: ');
          console.log(predicted);
          let predictedLabel = ' ';
          for (let label of (predicted.labels || [])) {
            console.log(label);
            // @ts-ignore
            if(label.metadata?.confidence > 90.0) {
                predictedLabel +='#' + label.name + ' ';
            }
          }
      /* --- end PREDICTIONS --- */
      const postId = uuid();
      const postDescription = description + predictedLabel;
      const postInfo = {
        name,
        description: postDescription,
        location,
        image: image.name,
        id: postId,
        owner: user?.getUsername(),
        status: PostStatus.ACTIVE,
       };
      console.log("post info is");
      console.log(postInfo)
      const post = await DataStore.save(new Post(postInfo));

      /* send analytics event */
      Analytics.record({ name: 'postCreated' });

      updateFormState(currentState => ({ ...currentState, saving: false }));
      onSuccess(post)
    } catch (err) {
      console.log('error: ', err);
    }
  }, [formState, onSuccess, user]);

  return (
    <div className={containerStyle}>
      <input
        placeholder="Post name"
        name="name"
        className={inputStyle}
        onChange={onChangeText}
      />
      <input
        placeholder="Location"
        name="location"
        className={inputStyle}
        onChange={onChangeText}
      />
      <input
        placeholder="Description"
        name="description"
        className={inputStyle}
        onChange={onChangeText}
      />
      <input 
        type="file"
        onChange={onChangeFile}
      />
      { formState.file && <img className={imageStyle} alt="preview" src={formState.file} /> }
      <Button title="Create New Post" onClick={save} />
      <Button type="cancel" title="Cancel" onClick={onCancel} />
      { formState.saving && <p className={savingMessageStyle}>Saving post...</p> }
    </div>
  )
}

const inputStyle = css`
  margin-bottom: 10px;
  outline: none;
  padding: 7px;
  border: 1px solid #ddd;
  font-size: 16px;
  border-radius: 4px;
`

const imageStyle = css`
  height: 120px;
  margin: 10px 0px;
  object-fit: contain;
`

const containerStyle = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 420px;
  position: fixed;
  left: 0;
  border-radius: 4px;
  top: 0;
  margin-left: calc(50vw - 220px);
  margin-top: calc(50vh - 230px);
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.125rem 0.25rem;
  padding: 20px;
`

const savingMessageStyle = css`
  margin-bottom: 0px;
`