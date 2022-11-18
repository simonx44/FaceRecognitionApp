import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ISuccessAuthResponse,
  ISuccessUsersReponse,
  IUploadImageResponse,
  IUser,
  IUserFormInput,
} from "../types";

class RecognitionService {
  private readonly REGISTER_PATH = `/user/register`;
  private readonly AUTH_PATH = "/user/authenticate";
  private readonly USER_PATH = "/user";
  private readonly DELETE_PATH = "/deleteUser";
  private readonly UPLOAD_PATH = "/user/uploads";

  private httpService = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 8000,
  });

  public async register(image: string, userData: IUserFormInput) {
    const body = {
      properties: userData,
      userId: userData.userid,
      image: image,
    };

    return await this.httpService.post(this.REGISTER_PATH, body);
  }

  public async authenticate(
    img: string
  ): Promise<AxiosResponse<ISuccessAuthResponse, any>> {
    console.log("URL:");
    console.log(import.meta.env.VITE_API_URL);
    return await this.httpService.post(this.AUTH_PATH, { image: img });
  }

  public async getAllUser(): Promise<AxiosResponse<ISuccessUsersReponse, any>> {
    return await this.httpService.get(this.USER_PATH);
  }

  public async deleteUser(
    userId: string
  ): Promise<AxiosResponse<ISuccessUsersReponse, any>> {
    return await this.httpService.delete(`${this.DELETE_PATH}?id=${userId}`);
  }

  public async uploadImageToS3(img: string) {
    const response = await this.httpService.get<any>(
      `${this.UPLOAD_PATH}?type=png`
    );

    if (!response.data.body) {
      throw new Error("Upload failed");
    }

    const data = response.data.body as IUploadImageResponse;

    return await this.uploadImage(data, img);
  }

  private async urlToFile(url: string, mimeType: string) {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return new File([buf], "fileToUpload.png", { type: mimeType });
  }

  private async uploadImage(data: IUploadImageResponse, img: string) {
    const form = new FormData();
    const file = await this.urlToFile(img, "image/png");

    Object.keys(data.fields).forEach((field) => {
      console.log(field, data.fields[field]);
      form.append(field, data.fields[field]);
    });

    form.append("file", file);

    console.log(file);

    console.log(form);

    return await axios.post(data.url, form);
  }
}

export const recognitonService = new RecognitionService();
