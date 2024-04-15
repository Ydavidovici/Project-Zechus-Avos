document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/admin')
        .then(response => response.json())
        .then(data => {
            const table = document.createElement('table');
            data.forEach(item => {
                const row = document.createElement('tr');
                Object.values(item).forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                });
                table.appendChild(row);
            });
            document.getElementById('admin').appendChild(table);
        })
        .catch(error => console.error('Error:', error));
});
