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

            // Определяем пространства имен
            const namespaces = {
                rst: 'http://fsrar.ru/WEGAIS/ReplyRestBCode',
                ce: 'http://fsrar.ru/WEGAIS/CommonV3',
                ns: 'http://fsrar.ru/WEGAIS/WB_DOC_SINGLE_01'
            };

            // XPath для поиска элементов <ce:amccat>
            const xpath = "//rst:MarkInfo/ce:amccat";
            const marks = xmlDoc.evaluate(xpath, xmlDoc, (prefix) => namespaces[prefix] || null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            if (marks.snapshotLength === 0) {
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

            for (let i = 0; i < marks.snapshotLength; i++) {
                const amccat = marks.snapshotItem(i);

                const amc = amccat.querySelector('ce\\:amc')?.textContent || 'Отсутствует';
                const amcvol = amccat.querySelector('ce\\:amcvol')?.textContent || 'Полный объём';
                tableHtml += `<tr><td>${amc}</td><td>${amcvol}</td></tr>`;
            }

            tableHtml += '</tbody></table>';
            resultsContainer.innerHTML += tableHtml;
        };

        reader.readAsText(file);
    });
});
