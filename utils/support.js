// Generate Student Registration Number
exports.generateEnrollmentNumber = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `ENR${today}${randomNumber}`;
};
