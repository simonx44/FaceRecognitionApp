import axios from "axios";
import { Fragment, useState } from "react";
//import { useTimeoutFn } from "react-use";
import img from "./test.jpeg";

export default function Example() {
  /* const [file, setFile] = useState<any>();
  let [isShowing, setIsShowing] = useState(true);
  let [, , resetIsShowing] = useTimeoutFn(() => setIsShowing(true), 500);

  const requestUploadLink = () => {
    if (!file) return;

    const imageType = file.type as string;

    const type = imageType.split("/");

    const baseUrl = "https://lrjfd8r41c.execute-api.eu-west-1.amazonaws.com"; // process.env.REACT_APP_API_URL;

    const url = new URL(baseUrl + "/user/uploads");
    url.searchParams.append("type", type ? type[1] : "jpeg");
    url.searchParams.append("firstname", "simon");
    url.searchParams.append("lastname", "schwegler");

    axios
      .get(url.toString())
      .then((res) => {
        if (res.status === 200) {
          var form = new FormData();

          console.log(res.data.body);

          const { fields, url } = res.data.body;

          Object.entries(fields).forEach(([field, value]: any) => {
            form.append(field, value);
            console.log(field, value);
          });

          form.append("file", file);

          axios({
            method: "post",
            url: url,
            data: form,
            headers: { "Content-Type": "multipart/form-data" },
          })
            .then(function (response) {
              //handle success
              console.log(response.data);
            })
            .catch(function (response) {
              //handle error
              console.log(response.response.data);
            });
        }
      })
      .catch((err) => console.log(err));
  };

  const registerUser = () => {
    console.log(img);

    if (!img) {
      return;
    }

    const baseUrl = "http://127.0.0.1:3000"; // process.env.REACT_APP_API_URL;

    const body = {
      properties: { fName: "simon", lName: "sch", age: 1, id: "ronaldo" },
      userId: "ronaldo",
      image: img,
    };

    axios
      .post(baseUrl + "/user/register", body)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.log(err.response.data));
  };

  const uploadImage = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      console.log(img);
      setFile(img);
    }
  };
 */
  return (
    <div className="flex flex-col items-center py-16">
      {/*       <button
        onClick={() => {
          setIsShowing(false);
          resetIsShowing();
        }}
        className="backface-visibility-hidden mt-8 flex transform items-center rounded-full bg-black bg-opacity-20 px-3 py-2 text-sm font-medium text-white transition hover:scale-105 hover:bg-opacity-30 focus:outline-none active:bg-opacity-40"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 opacity-70">
          <path
            d="M14.9497 14.9498C12.2161 17.6835 7.78392 17.6835 5.05025 14.9498C2.31658 12.2162 2.31658 7.784 5.05025 5.05033C7.78392 2.31666 12.2161 2.31666 14.9497 5.05033C15.5333 5.63385 15.9922 6.29475 16.3266 7M16.9497 2L17 7H16.3266M12 7L16.3266 7"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>

        <span className="ml-3">Click to transition</span>
      </button>
      <button
        onClick={requestUploadLink}
        className="backface-visibility-hidden mt-8 flex transform items-center rounded-full bg-black bg-opacity-20 px-3 py-2 text-sm font-medium text-white transition hover:scale-105 hover:bg-opacity-30 focus:outline-none active:bg-opacity-40"
      >
        Click{" "}
      </button>
      <div>
        <h1>Select Image</h1>
        <input
          type="file"
          name="myImage"
          accept="image/jpeg"
          onChange={uploadImage}
        />
      </div>

      <button
        onClick={registerUser}
        className="backface-visibility-hidden mt-8 flex transform items-center rounded-full bg-black bg-opacity-20 px-3 py-2 text-sm font-medium text-white transition hover:scale-105 hover:bg-opacity-30 focus:outline-none active:bg-opacity-40"
      >
        <span className="ml-3">Register</span>
      </button> */}
    </div>
  );
}
