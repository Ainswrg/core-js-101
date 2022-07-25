/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    getArea() {
      return width * height;
    },
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.assign(Object.create(proto), JSON.parse(json));
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssSelectorBuilder {
  constructor() {
    this.selectors = [];
  }

  combine(...args) {
    const selectors = args
      .map((arg) => {
        if (arg instanceof CssSelectorBuilder) {
          return arg.selectors;
        }
        return `${arg}%sp`;
      })
      .reduce((acc, curr) => acc.concat(curr), []);

    this.selectors.push(selectors);
    this.checkCorrect(this.selectors);
    this.selectorArrangerRule(this.selectors);
    return this;
  }

  element(value) {
    this.selectors.push(`%el${value}`);
    this.checkCorrect(this.selectors);
    this.selectorArrangerRule(this.selectors);
    return this;
  }

  id(value) {
    this.selectors.push(`#${value}`);
    this.checkCorrect(this.selectors);
    this.selectorArrangerRule(this.selectors);
    return this;
  }

  class(value) {
    this.selectors.push(`%cl.${value}`);
    this.selectorArrangerRule(this.selectors);
    return this;
  }

  attr(value) {
    this.selectors.push(`%at[${value}]`);
    this.selectorArrangerRule(this.selectors);
    return this;
  }

  pseudoClass(value) {
    this.selectors.push(`%pc:${value}`);
    this.selectorArrangerRule(this.selectors);
    return this;
  }

  pseudoElement(value) {
    this.selectors.push(`%pe::${value}`);
    this.checkCorrect(this.selectors);
    this.selectorArrangerRule(this.selectors);
    return this;
  }

  stringify() {
    return this.selectors
      .join('')
      .split(',')
      .join('')
      .replace(/(%sp)+/g, ' ')
      .replace(/(%el)+/g, '')
      .replace(/(%cl)+/g, '')
      .replace(/(%pe)+/g, '')
      .replace(/(%pc)+/g, '')
      .replace(/(%at)+/g, '')
      .replace(/[' ']$/g, '');
  }

  checkCorrect(selectors) {
    const selectorsJoin = selectors.join(' ');
    selectorsJoin.split(' ').forEach((selector) => {
      selector.split('%sp').forEach((sel) => {
        if (sel.indexOf('%el') !== sel.lastIndexOf('%el')) {
          throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        if (sel.indexOf('#') !== sel.lastIndexOf('#')) {
          throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        if (sel.indexOf('%pe') !== sel.lastIndexOf('%pe')) {
          throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
      });
    });
    if (!selectors.join('').includes('%sp')) {
      if (selectorsJoin.indexOf('%el') !== selectorsJoin.lastIndexOf('%el')) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
      if (selectorsJoin.indexOf('#') !== selectorsJoin.lastIndexOf('#')) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
      if (selectorsJoin.indexOf('%pe') !== selectorsJoin.lastIndexOf('%pe')) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
    }
    return this;
  }

  selectorArrangerRule(selectors) {
    const selector = selectors.join('');
    if (selector.includes('%sp')) {
      selectors
        .join(' ')
        .split(',')
        .forEach((sel) => {
          if (
            (sel.includes('%el')
              && sel.includes('#')
              && sel.indexOf('%el') > sel.indexOf('#'))
            || (sel.includes('%el')
              && sel.includes('%cl')
              && sel.indexOf('%el') > sel.indexOf('%cl'))
            || (sel.includes('%el')
              && sel.includes('%at')
              && sel.indexOf('%el') > sel.indexOf('%at'))
            || (sel.includes('%el')
              && sel.includes('%pc')
              && sel.indexOf('%el') > sel.indexOf('%pc'))
            || (sel.includes('%el')
              && sel.includes('%pe')
              && sel.indexOf('%el') > sel.indexOf('%pe'))
          ) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
          }
          if (
            (sel.includes('#')
              && sel.includes('%el')
              && sel.indexOf('#') < sel.indexOf('%el'))
            || (sel.includes('#')
              && sel.includes('%cl')
              && sel.indexOf('#') > sel.indexOf('%cl'))
            || (sel.includes('#')
              && sel.includes('%at')
              && sel.indexOf('#') > sel.indexOf('%at'))
            || (sel.includes('#')
              && sel.includes('%pc')
              && sel.indexOf('#') > sel.indexOf('%pc'))
            || (sel.includes('#')
              && sel.includes('%pe')
              && sel.indexOf('#') > sel.indexOf('%pe'))
          ) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
          }
          if (
            (sel.includes('%cl')
              && sel.includes('%el')
              && sel.indexOf('%cl') < sel.indexOf('%el'))
            || (sel.includes('%cl')
              && sel.includes('#')
              && sel.indexOf('%cl') < sel.indexOf('#'))
            || (sel.includes('%cl')
              && sel.includes('%at')
              && sel.indexOf('%cl') > sel.indexOf('%at'))
            || (sel.includes('%cl')
              && sel.includes('%pc')
              && sel.indexOf('%cl') > sel.indexOf('%pc'))
            || (sel.includes('%cl')
              && sel.includes('%pe')
              && sel.indexOf('%cl') > sel.indexOf('%pe'))
          ) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
          }
          if (
            (sel.includes('%at')
              && sel.includes('%el')
              && sel.indexOf('%at') < sel.indexOf('%el'))
            || (sel.includes('%at')
              && sel.includes('#')
              && sel.indexOf('%at') < sel.indexOf('#'))
            || (sel.includes('%at')
              && sel.includes('%cl')
              && sel.indexOf('%at') < sel.indexOf('%cl'))
            || (sel.includes('%at')
              && sel.includes('%pc')
              && sel.indexOf('%at') > sel.indexOf('%pc'))
            || (sel.includes('%at')
              && sel.includes('%pe')
              && sel.indexOf('%at') > sel.indexOf('%pe'))
          ) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
          }
          if (
            (sel.includes('%pc')
              && sel.includes('%el')
              && sel.indexOf('%pc') < sel.indexOf('%el'))
            || (sel.includes('%pc')
              && sel.includes('#')
              && sel.indexOf('%pc') < sel.indexOf('#'))
            || (sel.includes('%pc')
              && sel.includes('%cl')
              && sel.indexOf('%pc') < sel.indexOf('%cl'))
            || (sel.includes('%pc')
              && sel.includes('%at')
              && sel.indexOf('%pc') < sel.indexOf('%at'))
            || (sel.includes('%pc')
              && sel.includes('%pe')
              && sel.indexOf('%pc') > sel.indexOf('%pe'))
          ) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
          }
          if (
            (sel.includes('%pe')
              && sel.includes('%el')
              && sel.indexOf('%pe') < sel.indexOf('%el'))
            || (sel.includes('%pe')
              && sel.includes('#')
              && sel.indexOf('%pe') < sel.indexOf('#'))
            || (sel.includes('%pe')
              && sel.includes('%cl')
              && sel.indexOf('%pe') < sel.indexOf('%cl'))
            || (sel.includes('%pe')
              && sel.includes('%at')
              && sel.indexOf('%pe') < sel.indexOf('%at'))
            || (sel.includes('%pe')
              && sel.includes('%pc')
              && sel.indexOf('%pe') < sel.indexOf('%pc'))
          ) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
          }
        });
    } else {
      if (
        (selector.includes('%el')
          && selector.includes('#')
          && selector.indexOf('%el') > selector.indexOf('#'))
        || (selector.includes('%el')
          && selector.includes('%cl')
          && selector.indexOf('%el') > selector.indexOf('%cl'))
        || (selector.includes('%el')
          && selector.includes('%at')
          && selector.indexOf('%el') > selector.indexOf('%at'))
        || (selector.includes('%el')
          && selector.includes('%pc')
          && selector.indexOf('%el') > selector.indexOf('%pc'))
        || (selector.includes('%el')
          && selector.includes('%pe')
          && selector.indexOf('%el') > selector.indexOf('%pe'))
      ) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
      if (
        (selector.includes('#')
          && selector.includes('%el')
          && selector.indexOf('#') < selector.indexOf('%el'))
        || (selector.includes('#')
          && selector.includes('%cl')
          && selector.indexOf('#') > selector.indexOf('%cl'))
        || (selector.includes('#')
          && selector.includes('%at')
          && selector.indexOf('#') > selector.indexOf('%at'))
        || (selector.includes('#')
          && selector.includes('%pc')
          && selector.indexOf('#') > selector.indexOf('%pc'))
        || (selector.includes('#')
          && selector.includes('%pe')
          && selector.indexOf('#') > selector.indexOf('%pe'))
      ) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
      if (
        (selector.includes('%cl')
          && selector.includes('%el')
          && selector.indexOf('%cl') < selector.indexOf('%el'))
        || (selector.includes('%cl')
          && selector.includes('#')
          && selector.indexOf('%cl') < selector.indexOf('#'))
        || (selector.includes('%cl')
          && selector.includes('%at')
          && selector.indexOf('%cl') > selector.indexOf('%at'))
        || (selector.includes('%cl')
          && selector.includes('%pc')
          && selector.indexOf('%cl') > selector.indexOf('%pc'))
        || (selector.includes('%cl')
          && selector.includes('%pe')
          && selector.indexOf('%cl') > selector.indexOf('%pe'))
      ) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
      if (
        (selector.includes('%at')
          && selector.includes('%el')
          && selector.indexOf('%at') < selector.indexOf('%el'))
        || (selector.includes('%at')
          && selector.includes('#')
          && selector.indexOf('%at') < selector.indexOf('#'))
        || (selector.includes('%at')
          && selector.includes('%cl')
          && selector.indexOf('%at') < selector.indexOf('%cl'))
        || (selector.includes('%at')
          && selector.includes('%pc')
          && selector.indexOf('%at') > selector.indexOf('%pc'))
        || (selector.includes('%at')
          && selector.includes('%pe')
          && selector.indexOf('%at') > selector.indexOf('%pe'))
      ) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
      if (
        (selector.includes('%pc')
          && selector.includes('%el')
          && selector.indexOf('%pc') < selector.indexOf('%el'))
        || (selector.includes('%pc')
          && selector.includes('#')
          && selector.indexOf('%pc') < selector.indexOf('#'))
        || (selector.includes('%pc')
          && selector.includes('%cl')
          && selector.indexOf('%pc') < selector.indexOf('%cl'))
        || (selector.includes('%pc')
          && selector.includes('%at')
          && selector.indexOf('%pc') < selector.indexOf('%at'))
        || (selector.includes('%pc')
          && selector.includes('%pe')
          && selector.indexOf('%pc') > selector.indexOf('%pe'))
      ) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
      if (
        (selector.includes('%pe')
          && selector.includes('%el')
          && selector.indexOf('%pe') < selector.indexOf('%el'))
        || (selector.includes('%pe')
          && selector.includes('#')
          && selector.indexOf('%pe') < selector.indexOf('#'))
        || (selector.includes('%pe')
          && selector.includes('%cl')
          && selector.indexOf('%pe') < selector.indexOf('%cl'))
        || (selector.includes('%pe')
          && selector.includes('%at')
          && selector.indexOf('%pe') < selector.indexOf('%at'))
        || (selector.includes('%pe')
          && selector.includes('%pc')
          && selector.indexOf('%pe') < selector.indexOf('%pc'))
      ) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
    }
    return this;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new CssSelectorBuilder().element(value);
  },

  id(value) {
    return new CssSelectorBuilder().id(value);
  },

  class(value) {
    return new CssSelectorBuilder().class(value);
  },

  attr(value) {
    return new CssSelectorBuilder().attr(value);
  },

  pseudoClass(value) {
    return new CssSelectorBuilder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new CssSelectorBuilder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new CssSelectorBuilder().combine(
      selector1.selectors,
      combinator,
      selector2.selectors,
    );
  },
  stringify() {
    return new CssSelectorBuilder().stringify();
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
