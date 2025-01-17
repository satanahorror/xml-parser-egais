document.getElementById('parseButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Очистить старые результаты

    if (fileInput.files.length === 0) {
        alert('Выберите хотя бы один XML-файл!');
        return;
    }

    // Проход по всем выбранным файлам
    Array.from(fileInput.files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(event.target.result, 'application/xml');

            // Парсинг XML
            const namespaces = {
                rst: 'http://fsrar.ru/WEGAIS/ReplyRestBCode',
                ce: 'http://fsrar.ru/WEGAIS/CommonV3'
            };

            const marks = Array.from(
                xmlDoc.querySelectorAll('rst\\:MarkInfo ce\\:amccat, MarkInfo ce\\:amccat')
            );

            if (marks.length === 0) {
                resultsContainer.innerHTML += `<p>В файле <strong>${file.name}</strong> не найдено элементов <code>&lt;ce:amccat&gt;</code>.</p>`;
                return;
            }

            // Генерация таблицы
            let tableHtml = `
                <h2>Результаты для файла: ${file.name}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Марка</th>
                            <th>Объём</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            marks.forEach(mark => {
                const amc = mark.querySelector('ce\\:amc')?.textContent || 'Отсутствует';
                const amcvol = mark.querySelector('ce\\:amcvol')?.textContent || 'Отсутствует';
                tableHtml += `<tr><td>${amc}</td><td>${amcvol}</td></tr>`;
            });

            tableHtml += '</tbody></table>';
            resultsContainer.innerHTML += tableHtml;
        };

        reader.readAsText(file);
    });
});
