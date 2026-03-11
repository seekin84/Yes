// Get Firebase services
const db = firebase.firestore();
const functions = firebase.functions();

// References to HTML elements
const secretCodeInput = document.getElementById('secretCode');
const submitCodeBtn = document.getElementById('submitCode');
const codeMessage = document.getElementById('codeMessage');
const announcementPostDiv = document.getElementById('announcementPost');
const announcementTextInput = document.getElementById('announcementText');
const postAnnouncementBtn = document.getElementById('postAnnouncement');
const postMessage = document.getElementById('postMessage');
const currentAnnouncementMessage = document.getElementById('currentAnnouncementMessage');

// Reference to Cloud Function
const manageAnnouncement = functions.httpsCallable('manageAnnouncement');

// Real-time display of current announcement
db.collection('app_data').doc('current_announcement')
  .onSnapshot((doc) => {
      if (doc.exists) {
          currentAnnouncementMessage.textContent = doc.data().message || 'No announcement yet.';
      } else {
          currentAnnouncementMessage.textContent = 'No announcement yet.';
      }
  }, (error) => {
      console.error("Error fetching announcement:", error);
      currentAnnouncementMessage.textContent = 'Error loading announcement.';
  });

// Code Submission
submitCodeBtn.addEventListener('click', async () => {
    const code = secretCodeInput.value;
    codeMessage.classList.add('hidden');
    codeMessage.style.color = 'white';

    if (!code) {
        codeMessage.textContent = 'Please enter the secret code.';
        codeMessage.classList.remove('hidden');
        return;
    }

    try {
        codeMessage.textContent = 'Checking code...';
        codeMessage.classList.remove('hidden');

        const result = await manageAnnouncement({ code: code });

        if (result.data.status === 'success') {
            codeMessage.textContent = result.data.message;
            codeMessage.style.color = 'lightgreen';
            secretCodeInput.disabled = true;
            submitCodeBtn.disabled = true;
            announcementPostDiv.classList.remove('hidden');
        } else {
            codeMessage.textContent = 'Unknown error. Try again.';
            codeMessage.style.color = 'red';
        }
    } catch (error) {
        console.error("Error calling Cloud Function:", error);
        codeMessage.textContent = error.message || 'Error validating code.';
        codeMessage.style.color = 'red';
        codeMessage.classList.remove('hidden');
    }
});

// Announcement Posting
postAnnouncementBtn.addEventListener('click', async () => {
    const message = announcementTextInput.value;
    postMessage.classList.add('hidden');
    postMessage.style.color = 'white';

    const code = secretCodeInput.value;

    if (!message) {
        postMessage.textContent = 'Announcement cannot be empty.';
        postMessage.classList.remove('hidden');
        return;
    }

    try {
        postMessage.textContent = 'Posting announcement...';
        postMessage.classList.remove('hidden');

        const result = await manageAnnouncement({ code: code, message: message });

        if (result.data.status === 'success') {
            postMessage.textContent = result.data.message;
            postMessage.style.color = 'lightgreen';
            announcementTextInput.value = '';
        } else {
            postMessage.textContent = 'Error posting announcement.';
            postMessage.style.color = 'red';
        }
    } catch (error) {
        console.error("Error posting announcement:", error);
        postMessage.textContent = error.message || 'Error posting announcement.';
        postMessage.style.color = 'red';
        postMessage.classList.remove('hidden');
    }
});