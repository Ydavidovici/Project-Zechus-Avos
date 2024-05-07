// utilities/dataFormatter.js
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US');
}

function formatCurrency(amount) {
    return `$${(amount / 100).toFixed(2)}`;
}

module.exports = { formatDate, formatCurrency };
