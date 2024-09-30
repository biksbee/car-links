
import './App.css';
import {useEffect, useState} from 'react'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {

    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

  const regex = /(\d+)(?=\.\w+$)/;
  const [links, setLinks] = useState([])
  const [inpString, setInpString] = useState(null)
  const [inpNumber, setInpNumber] = useState(null)

    async function fetchImage(url) {
        try {
            const response = await fetch(proxyUrl + url)
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    console.log('Image fetched via CORS proxy:', url);
                })
                .catch(error => console.error('Error fetching image:', error));
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${url} (status: ${response.status})`);
            }
            return await response.blob(); // Возвращаем содержимое файла в виде Blob
        } catch (error) {
            console.error(`Error fetching image ${url}:`, error);
            return null; // Возвращаем null, если загрузка не удалась
        }
    }

    async function downloadImagesAsZip() {
        const zip = new JSZip(); // Создаем новый ZIP архив
        const imgFolder = zip.folder('images'); // Создаем папку "images" внутри архива

        for (let i = 0; i < links.length; i++) {
            const url = links[i];
            const fileName = url.split('/').pop(); // Извлекаем имя файла из URL

            try {
                const imageBlob = await fetchImage(url); // Скачиваем изображение
                if (imageBlob) {
                    imgFolder.file(fileName, imageBlob); // Добавляем файл в архив, если он был успешно загружен
                    console.log(`Added ${fileName} to archive.`);
                } else {
                    console.warn(`Skipping ${fileName} because the image could not be fetched.`);
                }
            } catch (error) {
                console.error(`Error processing image ${url}:`, error);
            }
        }

        // Генерация ZIP архива и его скачивание
        zip.generateAsync({ type: 'blob' }).then(function (blob) {
            saveAs(blob, 'images.zip'); // Сохраняем архив на диск
        });
    }

    useEffect(() => {
        if(inpString && inpNumber) {
            const match = inpString.match(regex)
            let startNumber = match ? parseInt(match[0], 10) : 0
            const filledArray = Array.from({ length: inpNumber }, (_, i) => {
                const newNumber = startNumber + i; // увеличиваем число на каждый шаг
                return inpString.replace(regex, newNumber); // заменяем старое число на новое
            })
            setLinks(filledArray)
        }
    }, [inpString, inpNumber])

  return (
    <div className="App">
        <div className={'container'}>
            <div className={'input-container'}>
                <input
                    name={'car-link'}
                    value={inpString}
                    placeholder={'Введите ссылку'}
                    onChange={(e) => setInpString(e.target.value)}
                    type="text"
                    className={'input-link'}
                />
            </div>
            <div className={'input-container'}>
                <input
                    name={'car-link-number'}
                    value={inpNumber}
                    placeholder={'Число картинок'}
                    onChange={(e) => setInpNumber(e.target.value)}
                    type="text"
                    className={'input-link-number'}
                />
            </div>
            <div className={'button-inp'} onClick={downloadImagesAsZip}>
                скачать
            </div>
        </div>
        <div className={'container2'}>
        {
                links.length > 0 ? links.map(link => (
                    <div>
                        <img src={link} alt="Описание изображения" style={{width: '300px', height: 'auto'}}/>
                    </div>
                )) : <div>картинок нет</div>
            }
        </div>
    </div>
  );
}

export default App;
