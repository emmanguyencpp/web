// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.getElementById('header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('back-to-top');
    
    // Gallery indicators
    const indicators = document.querySelectorAll('.indicator');
    const galleryTrack = document.querySelector('.gallery-track');
    
    // Menu by Pax
    const paxButtons = document.querySelectorAll('.pax-btn');
    const menuDisplays = document.querySelectorAll('.menu-display');
    
    // Dish tabs
    const dishTabs = document.querySelectorAll('.dish-tab');
    const dishGrids = document.querySelectorAll('.dish-grid');
    
    // Booking form
    const bookingForm = document.getElementById('booking-form');
    
    // Dish order buttons
    const dishOrderButtons = document.querySelectorAll('.dish-order-btn');
    
    // Initialize the website
    initWebsite();
    
    function initWebsite() {
        // Header scroll effect
        window.addEventListener('scroll', handleScroll);
        
        // Mobile menu toggle
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Back to top button
        backToTop.addEventListener('click', scrollToTop);
        
        // Gallery indicators
        setupGalleryIndicators();
        
        // Menu by Pax switching
        setupPaxMenu();
        
        // Dish tabs
        setupDishTabs();
        
        // Booking form
        setupBookingForm();
        
        // Dish order buttons
        setupDishOrderButtons();
        
        // Initial check for back to top button
        handleScroll();
    }
    
    function handleScroll() {
        // Header scroll effect
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
            backToTop.classList.add('visible');
        } else {
            header.classList.remove('scrolled');
            backToTop.classList.remove('visible');
        }
        
        // Active nav link based on scroll position
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    function toggleMobileMenu() {
        nav.classList.toggle('active');
        mobileMenuBtn.innerHTML = nav.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    }
    
    function closeMobileMenu() {
        nav.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    function setupGalleryIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                // Remove active class from all indicators
                indicators.forEach(ind => ind.classList.remove('active'));
                
                // Add active class to clicked indicator
                indicator.classList.add('active');
                
                // Calculate the translateX value based on slide index
                const translateXValue = -(index * 25);
                galleryTrack.style.animation = 'none';
                galleryTrack.style.transform = `translateX(${translateXValue}%)`;
                
                // Restart animation after a short delay
                setTimeout(() => {
                    galleryTrack.style.animation = 'slideGallery 20s infinite';
                }, 50);
            });
        });
        
        // Auto-update indicators based on animation
        let currentSlide = 0;
        setInterval(() => {
            indicators.forEach(ind => ind.classList.remove('active'));
            currentSlide = (currentSlide + 1) % indicators.length;
            indicators[currentSlide].classList.add('active');
        }, 5000);
    }
    
    function setupPaxMenu() {
        paxButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                paxButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get the pax value
                const pax = button.getAttribute('data-pax');
                
                // Hide all menu displays
                menuDisplays.forEach(display => {
                    display.classList.remove('active');
                });
                
                // Show the selected menu
                const selectedMenu = document.getElementById(`menu-${pax}`);
                if (selectedMenu) {
                    selectedMenu.classList.add('active');
                }
            });
        });
    }
    
    function setupDishTabs() {
        dishTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                dishTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get the tab value
                const tabType = tab.getAttribute('data-tab');
                
                // Hide all dish grids
                dishGrids.forEach(grid => {
                    grid.classList.remove('active');
                });
                
                // Show the selected dish grid
                const selectedGrid = document.getElementById(`${tabType}-dishes`);
                if (selectedGrid) {
                    selectedGrid.classList.add('active');
                }
            });
        });
    }
    
    function setupBookingForm() {
        if (!bookingForm) return;
        
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (validateBookingForm()) {
                // Show loading state
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loading"></span> ĐANG XỬ LÝ...';
                submitBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    // Show success message
                    showFormMessage('Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.', 'success');
                    
                    // Reset form
                    bookingForm.reset();
                    
                    // Restore button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
        
        // Real-time validation
        const formInputs = bookingForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                clearFieldError(input);
            });
        });
        
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
    }
    
    function validateBookingForm() {
        let isValid = true;
        const requiredFields = bookingForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Validate phone number
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value.trim()) {
            const phoneRegex = /^(0|\+84)(\d{9,10})$/;
            if (!phoneRegex.test(phoneField.value.trim())) {
                showFieldError(phoneField, 'Số điện thoại không hợp lệ');
                isValid = false;
            }
        }
        
        // Validate email if provided
        const emailField = document.getElementById('email');
        if (emailField && emailField.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value.trim())) {
                showFieldError(emailField, 'Email không hợp lệ');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.previousElementSibling?.textContent || 'Trường này';
        
        if (field.required && !value) {
            showFieldError(field, `${fieldName} là bắt buộc`);
            return false;
        }
        
        // Clear any existing error
        clearFieldError(field);
        return true;
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.textContent = message;
        }
    }
    
    function clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.textContent = '';
        }
    }
    
    function showFormMessage(message, type) {
        // Remove any existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type === 'success' ? 'success-message' : 'error-message'}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Insert after the form
        bookingForm.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
    
    function setupDishOrderButtons() {
        dishOrderButtons.forEach(button => {
            button.addEventListener('click', function() {
                const dishCard = this.closest('.dish-card');
                const dishName = dishCard.querySelector('.dish-name').textContent;
                const dishPrice = dishCard.querySelector('.dish-price').textContent;
                
                // Show notification
                showOrderNotification(dishName, dishPrice);
                
                // Button animation
                this.innerHTML = '<i class="fas fa-check"></i> ĐÃ THÊM';
                this.style.backgroundColor = 'var(--success-color)';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.innerHTML = 'Thêm vào đơn';
                    this.style.backgroundColor = '';
                }, 2000);
            });
        });
    }
    
    function showOrderNotification(dishName, dishPrice) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'order-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>${dishName}</strong>
                    <p>${dishPrice} đã được thêm vào đơn</p>
                </div>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: white;
            border-left: 4px solid var(--success-color);
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            padding: 15px 20px;
            z-index: 1001;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; transform: translateX(100%); }
        }
        
        .order-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .order-notification i {
            font-size: 1.5rem;
            color: var(--success-color);
        }
        
        .order-notification strong {
            display: block;
            margin-bottom: 5px;
            color: var(--dark-color);
        }
        
        .order-notification p {
            margin: 0;
            color: var(--text-light);
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
});