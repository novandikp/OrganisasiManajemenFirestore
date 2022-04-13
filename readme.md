# Sistem Manajemen Organisasi
Live Preview : https://organisasimanajemen-6aad0.web.app

###1. Konfigurasi Database
   
Database yang digunakan project ini adalah Firebase Firestore. Aplikasi dapat digunakan tanpa mengganti konfigurasi database. Dengan membuka index.html pada root folder aplikasi akan berjalan.


#### Untuk mengganti projek firebase (Optional)


Dapat dilanjutkan dengan membuka index.html jika tidak ingin mengganti
database


    npm install -g node-firestore-import-export

1. Buka Firebase console
2. Pilih Project
3. Buka Firestore Database
4. Klik Create Database
5. Pilih Start in production mode
6. Klik Enable
7. Buka Rules
8. Ubah 'allow read, write: if false;' menjadi 'allow read, write: if true;'
9. Lalu Publish
10. Pergi ke Project Settings 
11. Pergi ke Service Accounts
12. Tekan Generate New Private Key

File JSON yang terdownload digunakan untuk merestore database berikan nama config.json
untuk mempermudah

13. Buka https://console.cloud.google.com/firestore/
14. Ubah Firestore menjadi Native Datastore



Lalu jalankan script dibawah

    firestore-import --accountCredentials config.json --backupFile organisasi.json

Ubah config.json sesuai nama file JSON terdownload sebelumnya



    script/app.js

Ubah const firebaseConfig sesuai firebase console


###2. Login
   
Untuk mengakses Member Panel diperlukan login berikut akun yang dapat digunakan


Email : admin@gmail.com
Password : admin123