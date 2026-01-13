import './styles.scss';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import ru from './locales/ru.js';

yup.setLocale({
  mixed: {
    notOneOf: 'notOneOf',
    required: 'required',
  },
  string: {
    url: 'url',
  },
});

const validateUrl = (url, feeds) => {
  const schema = yup.string()
    .required()
    .url()
    .notOneOf(feeds);

  return schema.validate(url);
};

const app = () => {
  const state = {
    form: {
      status: 'filling',
      error: null,
    },
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  i18next.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  }).then(() => {
    const watchedState = onChange(state, render(state, elements, i18next));

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();

      validateUrl(url, state.feeds)
        .then((validUrl) => {
          watchedState.feeds.push(validUrl);
          watchedState.form.error = null;
          watchedState.form.status = 'valid';
        })
        .catch((err) => {
          watchedState.form.error = err.message;
          watchedState.form.status = 'invalid';
        });
    });
  });
};

app();
