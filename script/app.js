// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import Chipper from "./library/Chipper.js";
import * as firebasedatabase from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrH3jBiL0UawmG7nVs_BXG9U4NnQ8XBa4",
  authDomain: "organisasimanajemen-6aad0.firebaseapp.com",
  databaseURL:
    "https://organisasimanajemen-6aad0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "organisasimanajemen-6aad0",
  storageBucket: "organisasimanajemen-6aad0.appspot.com",
  messagingSenderId: "922142036836",
  appId: "1:922142036836:web:ac1d46a4e72ce98295e071",
  measurementId: "G-DVH23QVKV0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = firebasedatabase.getFirestore();

const getChildOnce = (data) => {
  let temp = Object.values(data)[0];
  temp.id = Object.keys(data)[0];
  return temp;
};
// readIssues();

const defFunc = () => {};
const errFunc = (error) => {
  console.error(error);
};

function uuid(prefix = "") {
  return (
    prefix +
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
  );
}

function responseResult(status, data, message = "") {
  return {
    status,
    data,
    message,
  };
}

function isLogin() {
  if (localStorage.getItem("user_info")) {
    return true;
  } else {
    return false;
  }
}

function getUserInfo() {
  if (isLogin) {
    return JSON.parse(localStorage.getItem("user_info"));
  } else {
    return null;
  }
}

function signOut() {
  localStorage.removeItem("user_info");
  redirect_to("masuk");
}

$("[data-access='sign-out']").click(function () {
  signOut();
});

function uploadFile(file, path, callback = defFunc, error = errFunc) {
  $.ajax({
    url: "https://content.dropboxapi.com/2/files/upload",
    type: "post",
    data: file,
    processData: false,
    contentType: "application/octet-stream",
    headers: {
      Authorization:
        "Bearer sl.BEKzM5ZH0jr6acC7cq-i-c_fPRwoKFHwT4CgpATvkvvAmD_V2oAK4MT44qiLFJICBSjEdPSluhch3Id0qz83dl3HsPsbkQUdxllZBNu-Xd1kyfSX8PsvD8MiQvgFrY_-E0FeSNo",
      "Dropbox-API-Arg":
        '{"path":"/OKE.png","mode": "add","autorename": true,"mute": false}',
    },
    success: callback,
    error: error,
  });
}

function thumbnailFile(input, image) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      image.attr("src", e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function base_url(param = "/") {
  if (param[0] != "/") {
    param = "/" + param;
  }
  if (!param.includes(".html")) {
    param = param + ".html";
  }
  return window.location.origin + param;
}

function redirect_to(url) {
  window.location.href = base_url(url);
}
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const chipper = new Chipper("OKE123");

// Middleware
if (document.URL.includes("/pages")) {
  if (!isLogin()) {
    redirect_to("masuk");
  }
} else if (
  document.URL.includes("/masuk.html") ||
  document.URL.includes("/register.html")
) {
  if (isLogin()) {
    redirect_to("pages/anggota");
  }
}
//

window.db = db;
window.getDocs = firebasedatabase.getDocs;
window.getDoc = firebasedatabase.getDoc;
window.collection = firebasedatabase.collection;

window.fbcollection = firebasedatabase.collection;
window.doc = firebasedatabase.doc;
window.setDoc = firebasedatabase.setDoc;
window.deleteDoc = firebasedatabase.deleteDoc;
window.collectionGroup = firebasedatabase.collectionGroup;
window.responseResult = responseResult;
window.uuid = uuid;
window.where = firebasedatabase.where;
window.query = firebasedatabase.query;
window.limit = firebasedatabase.limit;
window.getUserInfo = getUserInfo;
window.isLogin = isLogin;
window.Timestamp = firebasedatabase.Timestamp;
window.uploadFile = uploadFile;
window.thumbnailFile = thumbnailFile;
window.Chipper = chipper;
window.params = params;
window.base_url = base_url;
window.redirect_to = redirect_to;
