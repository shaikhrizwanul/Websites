// script.js — New Modern Furniture — Enhanced Interactions

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. NAVIGATION — Scroll Effect & Active Link
    // ============================================
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link:not(.nav-cta)');

    function updateNavbar() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link based on scroll position
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateNavbar);
    updateNavbar(); // Call on load

    // ============================================
    // 2. MOBILE MENU TOGGLE
    // ============================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const mobileMenuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        if (navLinks.classList.contains('active')) {
            mobileMenuIcon.classList.replace('ph-list', 'ph-x');
        } else {
            mobileMenuIcon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuIcon.classList.replace('ph-x', 'ph-list');
        });
    });

    // ============================================
    // 3. SCROLL ANIMATIONS (IntersectionObserver)
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-up').forEach(el => {
        animObserver.observe(el);
    });

    // ============================================
    // 4. NUMBER COUNTER ANIMATION
    // ============================================
    const counters = document.querySelectorAll('.stat-number, .experience-badge .years');
    let countersAnimated = new Set();

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated.has(entry.target)) {
                countersAnimated.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        if (isNaN(target)) return;
        
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (target - startValue) * eased);
            
            el.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }
        
        requestAnimationFrame(update);
    }

    // ============================================
    // 5. PARALLAX HERO BACKGROUND
    // ============================================
    const heroBg = document.getElementById('heroBg');
    
    if (heroBg) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const heroHeight = document.querySelector('.hero').offsetHeight;
                    
                    if (scrollY < heroHeight) {
                        heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // 6. FAQ ACCORDION
    // ============================================
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item.active').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ============================================
    // 7. FILE UPLOAD & DRAG-AND-DROP
    // ============================================
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('file');
    const fileList = document.getElementById('fileList');
    const contactForm = document.getElementById('contactForm');
    let selectedFiles = [];

    if (dropZone && fileInput) {
        // Highlight on drag
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
            handleFiles(e.dataTransfer.files);
        });

        // Handle click selected files
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });
    }

    function handleFiles(files) {
        const newFiles = Array.from(files);
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        
        newFiles.forEach(file => {
            if (file.size > MAX_SIZE) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return;
            }
            if (!selectedFiles.find(f => f.name === file.name)) {
                selectedFiles.push(file);
            }
        });
        
        updateFileUI();
    }

    function updateFileUI() {
        if (!fileList) return;
        fileList.innerHTML = '';
        
        if (selectedFiles.length > 0) {
            if (dropZone) {
                dropZone.querySelector('.upload-text').textContent = `${selectedFiles.length} file(s) selected`;
            }
            
            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
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
            
            document.querySelectorAll('.remove-file').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-index'));
                    selectedFiles.splice(idx, 1);
                    updateFileUI();
                    
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

    // ============================================
    // 8. FORM SUBMISSION (Web3Forms)
    // ============================================
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Validation
            const accessKeyInput = this.querySelector('input[name="access_key"]');
            if (accessKeyInput.value === 'YOUR_ACCESS_KEY_HERE') {
                alert("Please set your Web3Forms access key in index.html.");
                return;
            }
            
            // Loading state
            submitBtn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                // Remove the default empty file input from formData
                formData.delete('file');
                
                if (selectedFiles.length > 0) {
                    selectedFiles.forEach((file, index) => {
                        // Web3Forms naming convention: attachment, attachment2, attachment3...
                        const key = index === 0 ? 'attachment' : `attachment${index + 1}`;
                        formData.append(key, file);
                    });
                }
                
                console.log("Submitting form with files:", selectedFiles.length);
                
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                console.log("Web3Forms response:", data);
                
                if (data.success) {
                    submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Message Sent Successfully!';
                    submitBtn.style.background = '#25D366';
                    submitBtn.style.color = '#fff';
                    submitBtn.style.boxShadow = '0 4px 15px rgba(37, 211, 102, 0.3)';
                    submitBtn.style.animation = 'none';
                    
                    this.reset();
                    selectedFiles = [];
                    updateFileUI();
                    
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
                
                submitBtn.innerHTML = '<i class="ph ph-x-circle"></i> Failed to send. Please try WhatsApp.';
                submitBtn.style.background = '#e74c3c';
                submitBtn.style.color = '#fff';
                submitBtn.style.animation = 'none';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style = '';
                    submitBtn.disabled = false;
                }, 4000);
            }
        });
    }

    // ============================================
    // 9. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const navHeight = navbar.offsetHeight;
                const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 10;
                
                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

});
