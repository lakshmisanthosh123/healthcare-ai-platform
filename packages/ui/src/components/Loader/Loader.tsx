import type { FC } from "react";
import "./Loader.css";

export interface LoaderProps {
  size?: number;
  message?: string;
}

export const Loader: FC<LoaderProps> = ({ size = 48, message }) => {
  return (
    <div className="ui-loader">
      <div
        className="ui-loader__spinner"
        style={{ width: size, height: size }}
      />
      {message ? <span className="ui-loader__message">{message}</span> : null}
    </div>
  );
};
