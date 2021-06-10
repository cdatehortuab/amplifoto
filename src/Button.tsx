import { memo, MouseEventHandler } from 'react';
import { css } from '@emotion/css';

interface IButtonProps {
  title: string,
  onClick: MouseEventHandler,
  type?: string,
}

function Button({
  title, onClick, type = "action"
}: IButtonProps) {
  return (
    <button className={buttonStyle(type)} onClick={onClick}>
      {title}
    </button>
  )
}

const buttonStyle = (type: string) => css`
  background-color: ${type === "action" ? "#ff9900" : "red"};
  height: 40px;
  width: 160px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  outline: none;
  border: none;
  margin-top: 5px;
  cursor: pointer;
  :hover {
    background-color: ${type === "action" ? "#ffac31" : "#363636"} ; 
  }
`
export default memo(Button);
