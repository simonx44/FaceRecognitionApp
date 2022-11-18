import { type } from "os";

export type IUserFormInput = {
  fName: string;
  lName: string;
  age?: number;
  userid: string;
};

export type IHttpRequest<T> = {
  data?: T;
  error: { isError: boolean; message: "" };
  isLoading: boolean;
};

export type IApiError = {
  body: { errorMessage: string };
};

export type ISuccessAuthResponse = {
  body: {
    Status: string;
    userId?: string;
    userInfo?: IUser;
  };
};

export type ISuccessUsersReponse = {
  body: {
    users: Array<IUser>;
  };
};

export type IUser = {
  SK: string;
  rekognitionImageId: string;
  PK: string;
  imgUrl: string;
  fileName: string;
  property_bag: IPropertybag;
};

export type IPropertybag = {
  lName: string;
  fName: string;
  userid: string;
  age: number;
};

export type IUploadImageResponse = {
  fields: Record<string, string>;
  url: string;
};
