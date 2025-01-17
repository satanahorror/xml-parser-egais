document.getElementById('parseButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const downloadButton = document.getElementById('downloadButton');
    resultsContainer.innerHTML = ''; // Очистить старые результаты
    downloadButton.style.display = 'none'; // Скрыть кнопку скачивания, пока не обработаны файлы

    if (fileInput.files.length === 0) {
        alert('Выберите хотя бы один XML-файл!');
        return;
    }

    let allRows = [];

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

            // Функция для разрешения пространства имен
            const nsResolver = (prefix) => namespaces[prefix] || null;

            // XPath для поиска элементов <ce:amccat>
            const xpath = "//rst:MarkInfo/ce:amccat";
            const marks = xmlDoc.evaluate(xpath, xmlDoc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            if (marks.snapshotLength === 0) {
                allRows.push(`<p>В файле <strong>${file.name}</strong> не найдено элементов <code>&lt;ce:amccat&gt;</code>.</p>`);
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
            allRows.push(tableHtml);
        };

        reader.readAsText(file);
    });

    // После того как все файлы будут обработаны, формируем итоговый HTML файл
    const downloadHtml = () => {
        const htmlTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Результаты парсинга</title>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                </style>
            </head>
            <body>
                <h1>Результаты парсинга XML</h1>
                ${allRows.join('<hr>')}
            </body>
            </html>
        `;

        const blob = new Blob([htmlTemplate], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'parsed_results.html'; // Имя файла для скачивания
        link.click(); // Имитируем клик по ссылке для скачивания
    };

    // Когда все файлы обработаны, показываем кнопку для скачивания
    setTimeout(() => {
        downloadButton.style.display = 'inline-block'; // Показать кнопку скачивания
        downloadButton.addEventListener('click', downloadHtml);
    }, 1000); // Задержка, чтобы все файлы успели обработаться
});
