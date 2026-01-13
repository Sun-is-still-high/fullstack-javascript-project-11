import './styles.scss';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './view.js';
import parse from './parser.js';
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

const getProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const validateUrl = (url, urls) => {
  const schema = yup.string()
    .required()
    .url()
    .notOneOf(urls);

  return schema.validate(url);
};

const loadRss = (url) => axios.get(getProxyUrl(url))
  .then((response) => parse(response.data.contents));

const app = () => {
  const state = {
    form: {
      status: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    urls: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
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

      validateUrl(url, state.urls)
        .then(() => {
          watchedState.form.status = 'sending';
          return loadRss(url);
        })
        .then((data) => {
          const feedId = uniqueId();
          const feed = { ...data.feed, id: feedId, url };
          const posts = data.posts.map((post) => ({ ...post, id: uniqueId(), feedId }));

          watchedState.urls.push(url);
          watchedState.feeds.push(feed);
          watchedState.posts = [...posts, ...state.posts];
          watchedState.form.error = null;
          watchedState.form.status = 'valid';
        })
        .catch((err) => {
          if (err.isParsingError) {
            watchedState.form.error = 'parsingError';
          } else if (err.isAxiosError) {
            watchedState.form.error = 'networkError';
          } else {
            watchedState.form.error = err.message;
          }
          watchedState.form.status = 'invalid';
        });
    });
  });
};

app();
