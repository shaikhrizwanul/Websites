// script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation background on scroll
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Toggle icon between list and X
        if (navLinks.classList.contains('active')) {
            mobileMenuIcon.classList.replace('ph-list', 'ph-x');
        } else {
            mobileMenuIcon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuIcon.classList.replace('ph-x', 'ph-list');
        });
    });

    // 3. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated if you only want it to animate once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-up');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // 4. File Upload & Drag-and-Drop Logic
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('file');
    const fileList = document.getElementById('fileList');
    const contactForm = document.getElementById('contactForm');
    let selectedFiles = [];

    // Highlight drop zone when dragging files over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle click selected files
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        const newFiles = Array.from(files);
        // Basic validation: max 10MB per file
        const MAX_SIZE = 10 * 1024 * 1024;
        
        newFiles.forEach(file => {
            if (file.size > MAX_SIZE) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return;
            }
            // Prevent duplicates
            if (!selectedFiles.find(f => f.name === file.name)) {
                selectedFiles.push(file);
            }
        });
        
        updateFileUI();
    }

    function updateFileUI() {
        fileList.innerHTML = '';
        
        if (selectedFiles.length > 0) {
            dropZone.querySelector('.upload-text').textContent = `${selectedFiles.length} file(s) selected`;
            
            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                // Set icon based on type
                let iconClass = 'ph-file';
                if (file.type.includes('image')) iconClass = 'ph-image';
                else if (file.type.includes('pdf')) iconClass = 'ph-file-pdf';
                
                fileItem.innerHTML = `
                    <div class="file-name">
                        <i class="ph ${iconClass}"></i>
                        <span>${file.name}</span>
                    </div>
                    <button type="button" class="remove-file" data-index="${index}">
                        <i class="ph ph-x"></i>
                    </button>
                `;
                fileList.appendChild(fileItem);
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-file').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-index'));
                    selectedFiles.splice(idx, 1);
                    updateFileUI();
                    
                    // Reset input if empty so the same file can be selected again
                    if (selectedFiles.length === 0) {
                        fileInput.value = '';
                        dropZone.querySelector('.upload-text').textContent = 'Click to upload or drag & drop';
                    }
                });
            });
        } else {
            dropZone.querySelector('.upload-text').textContent = 'Click to upload or drag & drop';
        }
    }

    // 5. Form Submission Handling via Web3Forms API
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Validation: Ensure an access key is set
            const accessKeyInput = this.querySelector('input[name="access_key"]');
            if (accessKeyInput.value === 'YOUR_ACCESS_KEY_HERE') {
                alert("Please replace 'YOUR_ACCESS_KEY_HERE' in index.html with your actual Web3Forms access key.");
                return;
            }
            
            // Loading state
            submitBtn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Sending...';
            submitBtn.style.opacity = '0.8';
            submitBtn.disabled = true;
            
            try {
                // Gather form data
                const formData = new FormData(this);
                
                // Append the manually selected files to the FormData
                if (selectedFiles.length > 0) {
                    // Web3Forms accepts multiple files under the same key if the key ends in brackets `[]` or if it's named 'attachment'
                    selectedFiles.forEach((file, index) => {
                        formData.append(`attachment_${index}`, file);
                    });
                }
                
                // Send request to Web3Forms
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Success state
                    submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Message Sent Successfully!';
                    submitBtn.style.backgroundColor = '#25D366';
                    submitBtn.style.color = '#fff';
                    submitBtn.style.borderColor = '#25D366';
                    
                    // Reset form
                    this.reset();
                    selectedFiles = [];
                    updateFileUI();
                    
                    // Return button to normal after 4 seconds
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style = '';
                        submitBtn.disabled = false;
                    }, 4000);
                } else {
                    throw new Error(data.message || 'Form submission failed');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                
                // Error state
                submitBtn.innerHTML = '<i class="ph ph-x-circle"></i> Failed to send. Please try WhatsApp.';
                submitBtn.style.backgroundColor = '#ef4444';
                submitBtn.style.borderColor = '#ef4444';
                submitBtn.style.color = '#fff';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style = '';
                    submitBtn.disabled = false;
                }, 4000);
            }
        });
    }
});
