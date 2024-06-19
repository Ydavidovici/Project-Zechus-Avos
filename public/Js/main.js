document.addEventListener('DOMContentLoaded', () => {
    const sponsorshipButton = document.getElementById('sponsorship-info-button');
    const sponsorshipInfo = document.getElementById('sponsorship-info');


    if (sponsorshipButton && sponsorshipInfo) {
        sponsorshipInfo.style.display = 'none'; // Initially hide the info
        sponsorshipButton.addEventListener('click', () => {
            const isHidden = sponsorshipInfo.style.display === 'none';
            sponsorshipInfo.style.display = isHidden ? 'block' : 'none';
            sponsorshipInfo.style.animation = isHidden ? 'slideInFromLeft 1s ease-out forwards' : 'none';
        });
    }
});
