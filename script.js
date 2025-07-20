
document.addEventListener('DOMContentLoaded', () => {
    populateTemplateList();
    restoreSavedInputs();
});

// --- Main Buttons ---
document.getElementById('generate-btn').addEventListener('click', () => {
    const charName = document.getElementById('char-name').value;
    const charDesc = document.getElementById('char-desc').value;
    const face = document.getElementById('face').value;
    const eyes = document.getElementById('eyes').value;
    const hair = document.getElementById('hair').value;
    const body = document.getElementById('body').value;
    const clothing = document.getElementById('clothing').value;
    const accessories = document.getElementById('accessories').value;
    const scene = document.getElementById('scene').value;
    const style = document.getElementById('style').value;

    if (!charName.trim()) {
        showNotification('キャラクター名を入力してください。', 'error');
        return;
    }

    const characterId = `[${charName}: ${charDesc}]`;
    const essentialFeatures = `[face: ${face}, eyes: ${eyes}, hair: ${hair}, body: ${body}, clothing: ${clothing}, accessories: ${accessories}]`;
    const sceneElements = `[scene: ${scene}]`;
    const styleSpecification = `[style: ${style}]`;

    const prompt = `${characterId} ${essentialFeatures} ${sceneElements} ${styleSpecification}`;
    document.getElementById('result').value = prompt;
});

document.getElementById('copy-btn').addEventListener('click', (e) => {
    const resultTextarea = document.getElementById('result');
    if (resultTextarea.value.trim() === '') {
        showNotification('コピーするプロンプトがありません。', 'error');
        return;
    }
    resultTextarea.select();
    resultTextarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(resultTextarea.value).then(() => {
        const originalText = e.target.textContent;
        e.target.textContent = 'コピーしました！';
        e.target.style.background = 'var(--success-color)';
        setTimeout(() => {
            e.target.textContent = originalText;
            e.target.style.background = 'var(--success-color)';
        }, 2000);
        showNotification('プロンプトをクリップボードにコピーしました。', 'success');
    }).catch(err => {
        showNotification('コピーに失敗しました。', 'error');
    });
});

document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('すべての入力フィールドをクリアしますか？')) {
        setInputValues({});
        templateNameInput.value = '';
        document.getElementById('result').value = '';
        clearSavedInputs();
        showNotification('全フィールドをクリアしました。', 'success');
    }
});


// --- Template Management ---
const templateNameInput = document.getElementById('template-name');
const saveBtn = document.getElementById('save-btn');
const templateList = document.getElementById('template-list');
const loadBtn = document.getElementById('load-btn');
const deleteBtn = document.getElementById('delete-btn');

const getInputValues = () => ({
    charName: document.getElementById('char-name').value,
    charDesc: document.getElementById('char-desc').value,
    face: document.getElementById('face').value,
    eyes: document.getElementById('eyes').value,
    hair: document.getElementById('hair').value,
    body: document.getElementById('body').value,
    clothing: document.getElementById('clothing').value,
    accessories: document.getElementById('accessories').value,
    scene: document.getElementById('scene').value,
    style: document.getElementById('style').value,
});

const setInputValues = (data) => {
    document.getElementById('char-name').value = data.charName || '';
    document.getElementById('char-desc').value = data.charDesc || '';
    document.getElementById('face').value = data.face || '';
    document.getElementById('eyes').value = data.eyes || '';
    document.getElementById('hair').value = data.hair || '';
    document.getElementById('body').value = data.body || '';
    document.getElementById('clothing').value = data.clothing || '';
    document.getElementById('accessories').value = data.accessories || '';
    document.getElementById('scene').value = data.scene || '';
    document.getElementById('style').value = data.style || '';
};

const getTemplates = () => {
    return JSON.parse(localStorage.getItem('gemini-char-gen-templates')) || {};
};

const saveTemplate = (name, data) => {
    const templates = getTemplates();
    templates[name] = data;
    localStorage.setItem('gemini-char-gen-templates', JSON.stringify(templates));
    populateTemplateList();
};

const loadTemplate = (name) => {
    const templates = getTemplates();
    if (templates[name]) {
        setInputValues(templates[name]);
        templateNameInput.value = name;
    }
};

const deleteTemplate = (name) => {
    const templates = getTemplates();
    delete templates[name];
    localStorage.setItem('gemini-char-gen-templates', JSON.stringify(templates));
    populateTemplateList();
};

const populateTemplateList = () => {
    const templates = getTemplates();
    templateList.innerHTML = '';
    const initialOption = document.createElement('option');
    initialOption.textContent = 'テンプレートを選択...';
    initialOption.disabled = true;
    initialOption.selected = true;
    templateList.appendChild(initialOption);
    for (const name in templates) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        templateList.appendChild(option);
    }
};

saveBtn.addEventListener('click', () => {
    const name = templateNameInput.value.trim();
    if (name) {
        const data = getInputValues();
        saveTemplate(name, data);
        clearSavedInputs();
        showNotification(`テンプレート '${name}' を保存しました。`, 'success');
    } else {
        showNotification('テンプレート名を入力してください。', 'error');
    }
});

loadBtn.addEventListener('click', () => {
    const selectedName = templateList.value;
    if (selectedName && !templateList.options[templateList.selectedIndex].disabled) {
        loadTemplate(selectedName);
        showNotification(`テンプレート '${selectedName}' を読み込みました。`, 'success');
    } else {
        showNotification('読み込むテンプレートを選択してください。', 'error');
    }
});

deleteBtn.addEventListener('click', () => {
    const selectedName = templateList.value;
    if (selectedName && !templateList.options[templateList.selectedIndex].disabled) {
        if (confirm(`本当にテンプレート '${selectedName}' を削除しますか？`)) {
            deleteTemplate(selectedName);
            templateNameInput.value = '';
            setInputValues({});
            showNotification(`テンプレート '${selectedName}' を削除しました。`, 'success');
        }
    } else {
        showNotification('削除するテンプレートを選択してください。', 'error');
    }
});

// --- Auto-save and Restore ---
const SAVED_FORM_KEY = 'gemini-char-gen-autosave';
const savableInputs = document.querySelectorAll('.savable-input');

const saveCurrentInputs = () => {
    const data = {};
    savableInputs.forEach(input => {
        data[input.id] = input.value;
    });
    // Only save if there is at least one field with content
    if (Object.values(data).some(val => val.trim() !== '')) {
        localStorage.setItem(SAVED_FORM_KEY, JSON.stringify(data));
    } else {
        localStorage.removeItem(SAVED_FORM_KEY);
    }
};

const restoreSavedInputs = () => {
    const savedData = localStorage.getItem(SAVED_FORM_KEY);
    if (savedData) {
        if (confirm('前回入力した内容が残っています。復元しますか？')) {
            const data = JSON.parse(savedData);
            savableInputs.forEach(input => {
                if(data[input.id]) {
                    input.value = data[input.id];
                }
            });
            showNotification('入力内容を復元しました。', 'success');
        } else {
            // If user chooses not to restore, clear the saved data
            clearSavedInputs();
        }
    }
};

const clearSavedInputs = () => {
    localStorage.removeItem(SAVED_FORM_KEY);
};

savableInputs.forEach(input => {
    input.addEventListener('input', saveCurrentInputs);
});


// --- Notification System ---
const notificationContainer = document.getElementById('notification-container');

const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove());
    }, 3000);
};
