// Resume and Document Upload Handlers
window.uploadResume = async (fileInputId) => {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput || fileInput.files.length === 0) {
        window.showToast("Validation Error", "Please select a resume file first.", "warning");
        return null;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        window.showToast("Uploading", "Transferring file to secure storage...", "info");
        const res = await window.apiRequest("/students/resume", "POST", formData, true);
        window.showToast("Success", "Resume uploaded successfully!", "success");
        return res;
    } catch (err) {
        window.showToast("Upload Failed", err.message, "error");
        return null;
    }
};
