// src/config.js
const Mode = {
    DEV: 0,
    DEV_FRANCHU: 1,
    PROD: 2
};

// Define el modo actual
const currentMode = Mode.DEV_FRANCHU; // Cambia a Mode.PROD o Mode.DEV_FRANCHU según el entorno

// Configura la URL base de la API en función del modo
let API_BASE_URL;

if (currentMode === Mode.DEV) {
    API_BASE_URL = 'http://192.168.101.17:5000';
} else if (currentMode === Mode.DEV_FRANCHU) {
    API_BASE_URL = 'http://192.168.0.15:5000';
} else {
    API_BASE_URL = 'http://test.newvegan.cl';
}

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']; // jfif is not supported
const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi'];
const MAX_IMAGES_POST = 10;

export { API_BASE_URL, MAX_IMAGES_POST, ALLOWED_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS };