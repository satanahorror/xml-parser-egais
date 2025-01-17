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

            // Логируем XML для проверки
            console.log('Парсинг XML: ', xmlDoc);

            // Определяем пространство имен
            const namespaces = {
                rst: 'http://fsrar.ru/WEGAIS/ReplyRestBCode',
                ce: 'http://fsrar.ru/WEGAIS/CommonV3',
                ns: 'http://fsrar.ru/WEGAIS/WB_DOC_SINGLE_01'
            };

            // XPath для поиска элементов <ce:amccat>
            const marks = xmlDoc.getElementsByTagNameNS(namespaces['rst'], 'MarkInfo');
            let rowsForFile = [];
            let foundMarks = false;

            // Логируем количество найденных элементов
            console.log('Найдено элементов <rst:MarkInfo>: ', marks.length);

            for (let mark of marks) {
                // Получаем все <ce:amccat> внутри <rst:MarkInfo>
                const amccats = mark.getElementsByTagNameNS(namespaces['ce'], 'amccat');

                if (amccats.length > 0) {
                    foundMarks = true;

                    for (let amccat of amccats) {
                        const amc = amccat.getElementsByTagNameNS(namespaces['ce'], 'amc')[0];
                        const amcvol = amccat.getElementsByTagNameNS(namespaces['ce'], 'amcvol')[0];

                        // Проверяем, если <ce:amc> и <ce:amcvol> присутствуют
                        const amcText = amc ? amc.textContent : 'Отсутствует';
                        const amcvolText = amcvol ? amcvol.textContent : 'Полный объём';

                        rowsForFile.push(`<tr><td>${amcText}</td><td>${amcvolText}</td></tr>`);
                    }
                }
            }

            if (foundMarks) {
                allRows.push(`
                    <h2>Результаты для файла: ${file.name}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Марка</th>
                                <th>Объём</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsForFile.join('')}
                        </tbody>
                    </table>
                `);
            } else {
                allRows.push(`<p>В файле <strong>${file.name}</strong> не найдено элементов <code>&lt;ce:amccat&gt;</code>.</p>`);
            }
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

    // Когда все файлы будут обработаны, показываем кнопку для скачивания
    setTimeout(() => {
        downloadButton.style.display = 'inline-block'; // Показать кнопку скачивания
        downloadButton.addEventListener('click', downloadHtml);
    }, 1000); // Задержка, чтобы все файлы успели обработаться
});
