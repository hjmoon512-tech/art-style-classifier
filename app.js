const URL = "https://teachablemachine.withgoogle.com/models/bivl5nuJE/";

let model, maxPredictions;

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const resultContainer = document.getElementById('result-container');
const classNameEl = document.getElementById('class-name');
const confidenceScoreEl = document.getElementById('confidence-score');
const loadingEl = document.getElementById('loading');

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Error loading model:", error);
        loadingEl.textContent = "모델 로딩 실패. 다시 시도해주세요.";
        loadingEl.classList.remove('hidden');
    }
}

// Predict the image
async function predict() {
    loadingEl.classList.remove('hidden');
    resultContainer.classList.add('hidden');

    try {
        const prediction = await model.predict(imagePreview);

        // Find the prediction with the highest probability
        let highestPrediction = prediction[0];
        for (let i = 1; i < maxPredictions; i++) {
            if (prediction[i].probability > highestPrediction.probability) {
                highestPrediction = prediction[i];
            }
        }

        const className = highestPrediction.className;
        const probability = (highestPrediction.probability * 100).toFixed(1);

        classNameEl.textContent = className;
        confidenceScoreEl.textContent = `${probability}% 확신`;

        loadingEl.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    } catch (error) {
        console.error("Error during prediction:", error);
        loadingEl.textContent = "예측 중 오류가 발생했습니다.";
    }
}

// Handle file loading
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        // Wait for the image to load before predicting
        imagePreview.onload = () => {
            if (model) {
                predict();
            } else {
                loadingEl.textContent = "모델 로딩 중... 잠시 후 다시 시도해주세요.";
                loadingEl.classList.remove('hidden');
                // Attempt to init again and then predict
                init().then(() => {
                    if (model) predict();
                });
            }
        };
    };
    reader.readAsDataURL(file);
}

// Event Listeners for Drag and Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('active');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('active');
    }, false);
});

dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}, false);

// Event Listener for File Input
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

// Initialize model on load
window.addEventListener('DOMContentLoaded', init);
