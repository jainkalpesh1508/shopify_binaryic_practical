// @ts-nocheck
// @ts-ignore

(function () {
  'use strict';

  const modal = document.querySelector('#AjaxQuickShop');

  if (!modal) return;

  const elements = {
    dialog: modal.querySelector('.ajax-quick-shop-dialog'),
    loading: modal.querySelector('[data-quick-shop-loading]'),
    error: modal.querySelector('[data-quick-shop-error]'),
    content: modal.querySelector('[data-quick-shop-content]'),

    title: modal.querySelector('[data-quick-shop-title]'),
    price: modal.querySelector('[data-quick-shop-price]'),

    mainImage: modal.querySelector('[data-quick-shop-main-image]'),
    thumbnails: modal.querySelector('[data-quick-shop-thumbnails]'),

    options: modal.querySelector('[data-quick-shop-options]'),

    availability: modal.querySelector(
      '[data-quick-shop-availability]'
    ),

    quantity: modal.querySelector(
      '[data-quick-shop-quantity]'
    ),

    quantityMinus: modal.querySelector(
      '[data-quantity-minus]'
    ),

    quantityPlus: modal.querySelector(
      '[data-quantity-plus]'
    ),

    addButton: modal.querySelector(
      '[data-quick-shop-add]'
    ),

    addText: modal.querySelector('[data-add-text]'),

    addLoading: modal.querySelector(
      '[data-add-loading]'
    )
  };

  const state = {
    product: null,
    selectedOptions: [],
    selectedVariant: null,
    quantity: 1,
    currentHandle: null,
    previousFocus: null,
    isAddingToCart: false
  };


  function formatMoney(cents) {
    const currency = window.AjaxQuickShopConfig.currency;
    const locale = window.AjaxQuickShopConfig.locale || 'en';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2
    }).format(cents / 100);
  }

  function openModal() {
    state.previousFocus = document.activeElement;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    elements.dialog.focus();
  }

  function closeModal(updateHistory = true) {

    modal.classList.remove('is-open');

    modal.setAttribute(
        'aria-hidden',
        'true'
    );

    document.body.style.overflow = '';

    if (state.previousFocus) {
        state.previousFocus.focus();
    }

    state.currentHandle = null;

    if (updateHistory) {

        const url =
            new URL(window.location.href);

        if (
            url.searchParams.has('quick_shop')
        ) {

            url.searchParams.delete(
                'quick_shop'
            );

            window.history.pushState(
                {},
                '',
                url.toString()
            );
        }
    }
  }

  function showLoading() {
    elements.loading.hidden = false;
    elements.error.hidden = true;
    elements.content.hidden = true;
  }

  function showError() {
    elements.loading.hidden = true;
    elements.error.hidden = false;
    elements.content.hidden = true;
  }

  function showContent() {
    elements.loading.hidden = true;
    elements.error.hidden = true;
    elements.content.hidden = false;
  }

  async function fetchProduct(handle) {
    const response = await fetch(
      `/products/${encodeURIComponent(handle)}.js`
    );

    if (!response.ok) {
      throw new Error('Unable to fetch product.');
    }

    return response.json();
  }

  async function openQuickShop(handle) {
    state.currentHandle = handle;

    openModal();
    showLoading();

    try {
      const product = await fetchProduct(handle);

      state.product = product;

      renderProduct(product);

      showContent();

    } catch (error) {
      console.error(error);
      showError();
    }
  }

//   function renderProduct(product) {
//     elements.title.textContent = product.title;

//     renderPrice(product);
//     renderGallery(product);
//     renderOptions(product);

//     state.selectedOptions = [];

//     if (product.variants.length === 1) {
//       state.selectedVariant = product.variants[0];

//       state.selectedOptions =
//         product.variants[0].options.slice();

//       updateVariantUI();
//     } else {
//       state.selectedVariant = null;

//       elements.availability.textContent =
//         'Please select your options.';

//       elements.availability.className =
//         'ajax-quick-shop-availability';

//       elements.addButton.disabled = true;
//     }

//     elements.quantity.value = 1;
//     state.quantity = 1;
//   }

  function renderProduct(product) {

    state.product = product;
    state.selectedOptions = [];
    state.selectedVariant = null;
    state.quantity = 1;
    state.isAddingToCart = false;

    // console.table(
    //     product.variants.map(variant => ({
    //     id: variant.id,
    //     options: variant.options.join(' / '),
    //     available: variant.available,
    //     price: variant.price,
    //     inventory: variant.inventory_quantity
    //     }))
    // );

    elements.title.textContent =
        product.title;

    renderPrice(product);
    renderGallery(product);
    renderOptions(product);

    elements.quantity.value = 1;

    if (product.variants.length === 1) {

        state.selectedOptions = product.variants[0].options.slice();

        state.selectedVariant = product.variants[0];
    }

    updateVariantUI();
  }

  function renderPrice(product) {
    const price = product.price;
    const compareAtPrice = product.compare_at_price;

    let html = `
      <span class="ajax-quick-shop-current-price">
        ${formatMoney(price)}
      </span>
    `;

    if (
      compareAtPrice &&
      compareAtPrice > price
    ) {
      html += `
        <span class="ajax-quick-shop-compare-price">
          ${formatMoney(compareAtPrice)}
        </span>
      `;
    }

    elements.price.innerHTML = html;
  }

  function renderGallery(product) {
    elements.mainImage.innerHTML = '';
    elements.thumbnails.innerHTML = '';

    if (!product.images || !product.images.length) {
      elements.mainImage.innerHTML = `
        <div style="
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          No image
        </div>
      `;

      return;
    }

    product.images.forEach((image, index) => {

      if (index === 0) {
        setMainImage(image);
      }

      const thumbnail = document.createElement('button');

      thumbnail.type = 'button';

      thumbnail.className =
        'ajax-quick-shop-thumbnail';

      if (index === 0) {
        thumbnail.classList.add('is-active');
      }

      thumbnail.innerHTML = `
        <img
          src="${image}"
          alt="${escapeHtml(product.title)}"
          loading="lazy"
        >
      `;

      thumbnail.addEventListener('click', () => {

        setMainImage(image);

        elements.thumbnails
          .querySelectorAll('.ajax-quick-shop-thumbnail')
          .forEach(button => {
            button.classList.remove('is-active');
          });

        thumbnail.classList.add('is-active');
      });

      elements.thumbnails.appendChild(thumbnail);
    });
  }

  function setMainImage(image) {
    elements.mainImage.innerHTML = `
      <img
        src="${image}"
        alt="${escapeHtml(state.product.title)}"
      >
    `;
  }

  function renderOptions(product) {
    elements.options.innerHTML = '';

    product.options.forEach((option, optionIndex) => {

      const group = document.createElement('div');

      group.className =
        'ajax-quick-shop-option-group';

      group.innerHTML = `
        <div class="ajax-quick-shop-option-label">
          ${escapeHtml(option.name)}
        </div>

        <div
          class="ajax-quick-shop-option-values"
          data-option-index="${optionIndex}"
        ></div>
      `;

      const valuesContainer =
        group.querySelector(
          '.ajax-quick-shop-option-values'
        );

      option.values.forEach(value => {

        const button = document.createElement('button');

        button.type = 'button';

        button.className = 'ajax-quick-shop-option-value';

        button.textContent = value;

        button.dataset.optionIndex = optionIndex;

        button.dataset.optionValue = value;

        button.addEventListener('click', () => {
          selectOption(
            optionIndex,
            value
          );

        });

        valuesContainer.appendChild(button);
      });

      elements.options.appendChild(group);
    });
  }

  function selectOption(optionIndex, value) {
    state.selectedOptions[optionIndex] = value;

    state.selectedVariant = findSelectedVariant();

    updateVariantUI();
  }

  function findSelectedVariant() {
    if (!state.product) {
        return null;
    }

    const optionCount = state.product.options.length;

    if (
        state.selectedOptions.length !== optionCount ||
        state.selectedOptions.some(value => !value)
    ) {
        return null;
    }

    return state.product.variants.find(variant => {
        return variant.options.every((optionValue, index) => {
        return optionValue === state.selectedOptions[index];
        });
    }) || null;
  }

  function updateVariantUI() {

    updateVariantOptions();

    const variant = findSelectedVariant();

    state.selectedVariant = variant;

    if (!variant) {

        elements.addButton.disabled = true;

        const allSelected =
        state.product.options.length ===
        state.selectedOptions.length &&
        state.selectedOptions.every(
            value => value
        );

        if (allSelected) {

        elements.availability.textContent =
            'This combination is unavailable.';

        elements.availability.className =
            'ajax-quick-shop-availability is-sold-out';

        } else {

        elements.availability.textContent =
            'Please select all options.';

        elements.availability.className =
            'ajax-quick-shop-availability';
        }

        return;
    }

    let priceHTML = `
        <span class="ajax-quick-shop-current-price">
        ${formatMoney(variant.price)}
        </span>
    `;

    if (
        variant.compare_at_price &&
        variant.compare_at_price > variant.price
    ) {
        priceHTML += `
        <span class="ajax-quick-shop-compare-price">
            ${formatMoney(variant.compare_at_price)}
        </span>
        `;
    }

    elements.price.innerHTML = priceHTML;

    if (variant.available) {

        elements.availability.textContent =
        'In stock';

        elements.availability.className =
        'ajax-quick-shop-availability is-available';

        elements.addButton.disabled = false;

    } else {

        elements.availability.textContent =
        'Sold out';

        elements.availability.className =
        'ajax-quick-shop-availability is-sold-out';

        elements.addButton.disabled = true;
    }

    if (variant.featured_image) {

        setMainImage(
        variant.featured_image.src
        );

    }
  }

  function isOptionAvailable(optionIndex, optionValue) {
    if (!state.product) {
        return false;
    }

    const variants = state.product.variants || [];

    return variants.some(variant => {

        if (!variant.available) {
        return false;
        }

        return variant.options.every((variantValue, index) => {

        if (index === optionIndex) {
            return variantValue === optionValue;
        }

        const selectedValue =
            state.selectedOptions[index];

        if (selectedValue) {
            return variantValue === selectedValue;
        }

        return true;
        });
    });
  }

  function updateVariantOptions() {

    if (!state.product) {
        return;
    }

    const buttons =
        elements.options.querySelectorAll(
        '[data-option-index][data-option-value]'
        );

    buttons.forEach(button => {

        const optionIndex = Number(button.dataset.optionIndex);

        const optionValue = button.dataset.optionValue;

        const available =
        isOptionAvailable(
            optionIndex,
            optionValue
        );

        const selected = state.selectedOptions[optionIndex] === optionValue;

        button.disabled = !available;

        button.classList.toggle(
        'is-selected',
        selected
        );

        button.setAttribute(
        'aria-pressed',
        String(selected)
        );
    });
 }

  elements.quantityMinus.addEventListener(
    'click',
    () => {

      const current =
        parseInt(elements.quantity.value, 10) || 1;

      const quantity =
        Math.max(1, current - 1);

      elements.quantity.value = quantity;

      state.quantity = quantity;
    }
  );

  elements.quantityPlus.addEventListener(
    'click',
    () => {

      const current =
        parseInt(elements.quantity.value, 10) || 1;

      const quantity =
        current + 1;

      elements.quantity.value = quantity;

      state.quantity = quantity;
    }
  );

  elements.quantity.addEventListener(
    'change',
    () => {

      const quantity =
        Math.max(
          1,
          parseInt(
            elements.quantity.value,
            10
          ) || 1
        );

      elements.quantity.value = quantity;

      state.quantity = quantity;
    }
  );

  function escapeHtml(value) {
    const div = document.createElement('div');

    div.textContent = value;

    return div.innerHTML;
  }

  function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
  }

   async function addToCart() {

    if (state.isAddingToCart) {
        return;
    }

    const variant = state.selectedVariant;

    if (!variant) {
        return;
    }

    if (!variant.available) {
        return;
    }

    if (state.quantity < 1) {
        return;
    }

    if (elements.addButton.disabled) {
        return;
    }

    setAddLoading(true);

    try {

        const response = await fetch('/cart/add.js', {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },

        body: JSON.stringify({
            items: [
                {
                    id: variant.id,
                    quantity: state.quantity
                }
            ],

             sections: [
                'cart-drawer-section',
            ],

            sections_url: window.location.pathname
        })
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(
            data.description ||
            data.message ||
            'Unable to add product to cart.'
        );
        }

        console.log('Added to cart:',data);

        const cart = await fetchCart();
        updateCartCount(cart);

        updateHorizonCartDrawer(data);

        closeModal();

        requestAnimationFrame(() => {
            openHorizonCartDrawer();
        });

    } catch (error) {

        console.error(
        'Add to cart error:',
        error
        );

        showCartError(error.message);

    } finally {

        state.isAddingToCart = false;
        setAddLoading(false);
    }
  }

  function setAddLoading(isLoading) {

    if (elements.addButton) {
        elements.addButton.disabled =
            isLoading || !state.selectedVariant || !state.selectedVariant.available;
    }

    if (elements.addText) {
        elements.addText.hidden = isLoading;
    }

    if (elements.addLoading) {
        elements.addLoading.hidden = !isLoading;
    }

  }

  async function fetchCart() {

    const response = await fetch(
        '/cart.js',
        {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
        }
    );

    if (!response.ok) {
        throw new Error(
        'Unable to fetch cart.'
        );
    }

    return response.json();
  }

  function updateCartCount(cart) {

    const count = cart.item_count;
    const cartCountbubble = document.querySelectorAll('.cart-bubble');

    const selectors = [
        '[data-cart-count]',
        '.cart-count-bubble',
        '.cart-count',
        '.cart-bubble__text-count',
    ];

    const elementsToUpdate =
        document.querySelectorAll(
        selectors.join(',')
        );

    elementsToUpdate.forEach(element => {

        element.textContent = count;

        if (count === 0) {
            element.classList.add('hidden');
            cartCountbubble.forEach(bubble => {
                bubble.classList.add('visually-hidden');
            });
            
        } else {
            element.classList.remove('hidden');
            cartCountbubble.forEach(bubble => {
                bubble.classList.remove('visually-hidden');
            });
        }
    });
  }

  function showCartError(message) {

    elements.availability.textContent = message || 'Unable to add product to cart.';

    elements.availability.className = 'ajax-quick-shop-availability is-sold-out';
  }

  function openHorizonCartDrawer() {
    const cartDrawer = document.querySelector(
        'theme-drawer#cart-drawer'
    );

    if (!cartDrawer) {
        console.error('Horizon #cart-drawer theme-drawer not found.');
        return;
    }

    const dialog = cartDrawer.querySelector('dialog');

    if (!dialog) {
        console.error('Horizon cart drawer dialog not found.');
        return;
    }

    if (typeof cartDrawer.showDialog === 'function') {
        cartDrawer.showDialog();
        return;
    }

    if (typeof cartDrawer.open === 'function') {
        cartDrawer.open();
        return;
    }

    console.error(
        'Horizon cart drawer opening API not found.',
        cartDrawer
    );
  }

  function updateHorizonCartDrawer(data) {
    if (!data.sections) {
        console.warn('No cart sections returned from Shopify.');
        return;
    }

    const cartDrawerSection = data.sections['cart-drawer-section'];
    // console.log('cartDrawerSection', cartDrawerSection);
    
    if (cartDrawerSection) {
        const currentCartDrawer = document.querySelector(
            '#shopify-section-cart-drawer-section'
        );

        if (currentCartDrawer) {
        const parser = new DOMParser();

        const newDocument = parser.parseFromString(
            cartDrawerSection,
            'text/html'
        );

        const newCartDrawer = newDocument.querySelector(
            '#shopify-section-cart-drawer-section'
        );

        if (newCartDrawer) {
            currentCartDrawer.replaceWith(newCartDrawer);
        }
        }
    }
  }

  async function openQuickShop(handle, updateHistory = true) {

    state.currentHandle = handle;

    if (updateHistory) {
        const url = new URL(window.location.href);

        url.searchParams.set(
            'quick_shop',
            handle
        );

        window.history.pushState(
            {
                quickShop: handle
            },
            '',
            url.toString()
        );
    }

    openModal();
    showLoading();

    try {

        const product = await fetchProduct(handle);

        state.product = product;

        renderProduct(product);

        showContent();

    } catch (error) {

        console.error(error);

        showError();
    }
  }

  document.addEventListener('click', event => {

    const trigger =
      event.target.closest(
        '[data-quick-shop-trigger]'
      );

    if (!trigger) return;

    const handle =
      trigger.dataset.productHandle;

    if (!handle) return;

    openQuickShop(handle);
  });

  modal.addEventListener('click', event => {

    if (
      event.target.closest(
        '[data-quick-shop-close]'
      )
    ) {
      closeModal();
    }

  });

  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Escape' &&
        modal.classList.contains('is-open')
      ) {
        closeModal();
      }

    }
  );

  elements.addButton.addEventListener(
    'click',
    addToCart
  );

  window.addEventListener('popstate', () => {

    const url = new URL(window.location.href);

    const handle =
        url.searchParams.get('quick_shop');

    if (handle) {

        openQuickShop(
            handle,
            false
        );

    } else {

        if (modal.classList.contains('is-open')) {
            closeModal();
        }

    }
  });

  function openQuickShopFromURL() {
    const url = new URL(window.location.href);
    const handle = url.searchParams.get('quick_shop');

    if (!handle) return;

    openQuickShop(handle, false);
  }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            openQuickShopFromURL
        );
    } else {
        openQuickShopFromURL();
    }

})();
