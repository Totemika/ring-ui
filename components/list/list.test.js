/* eslint-disable no-magic-numbers */
import React from 'react';
import checkMarkIcon from '@jetbrains/icons/checkmark.svg';
import guid from 'mout/random/guid';
import {shallow, mount} from 'enzyme';
import VirtualizedList from 'react-virtualized/dist/commonjs/List';

import linkStyles from '../link/link.css';
import Icon from '../icon/icon';

import List from './list';
import ListItem from './list__item';
import ListCustom from './list__custom';
import ListLink from './list__link';
import ListTitle from './list__title';
import ListSeparator from './list__separator';

describe('List', () => {
  const Type = List.ListProps.Type;


  const shallowList = props => shallow(<List {...props}/>);
  const mountList = props => mount(<List {...props}/>);

  describe('virtualized', () => {
    function createItemMock(itemType) {
      return {
        rgItemType: itemType,
        label: guid()
      };
    }

    it('should pad the list with top/bottom margins', () => {
      const data = [
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM)
      ];

      const instance = shallowList({data}).instance();

      shallow(instance.renderItem({index: 0})).should.have.tagName('div');
      shallow(instance.renderItem({index: 3})).should.have.tagName('div');
    });

    it('should apply styles from virtualized', () => {
      const data = [
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM)
      ];

      const instance = shallowList({data}).instance();
      const style = {
        top: -1000
      };

      shallow(instance.renderItem({index: 0, style})).should.have.style('top', '-1000px');
      shallow(instance.renderItem({index: 1, style})).should.have.style('top', '-1000px');
      shallow(instance.renderItem({index: 2, style})).should.have.style('top', '-1000px');
      shallow(instance.renderItem({index: 3, style})).should.have.style('top', '-1000px');
    });

    it('should scroll to the active item', () => {
      const data = [
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM)
      ];

      const activeIndex = 1;

      const wrapper = mountList({data});
      wrapper.setState({
        activeIndex,
        needScrollToActive: true
      });

      wrapper.find(VirtualizedList).should.have.prop('scrollToIndex', 2);
    });

    it('should\'n scroll to the active item when needScrollToActive is false', () => {
      const data = [
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM),
        createItemMock(List.ListProps.Type.ITEM)
      ];

      const activeIndex = 1;

      const wrapper = mountList({data});
      wrapper.setState({
        activeIndex,
        needScrollToActive: false
      });

      wrapper.find(VirtualizedList).should.not.have.prop('scrollToIndex', 2);
    });
  });

  it('should check type of item', () => {
    const itemMock = {
      rgItemType: Type.SEPARATOR
    };

    List.isItemType(Type.SEPARATOR, itemMock).should.been.equal(true);
  });

  it('by default item has type equal ITEM', () => {
    const itemMock = {};

    List.isItemType(Type.ITEM, itemMock).should.been.equal(true);
    List.isItemType(Type.SEPARATOR, itemMock).should.been.equal(false);
  });

  it('should deselect item', () => {
    const instance = shallowList({
      data: [
        {}
      ],
      activeIndex: 0
    }).instance();

    instance.clearSelected();

    should.not.exist(instance.getSelected());
  });

  describe('should track activeIndex', () => {
    let wrapper;
    let instance;
    beforeEach(() => {
      wrapper = shallowList({
        data: [{key: 0}, {key: 1}, {key: 2}],
        activeIndex: 0,
        restoreActiveIndex: true
      });
      instance = wrapper.instance();
    });

    it('should set activeIndex from props', () => {
      wrapper.should.have.state('activeIndex', 0);
      wrapper.state('activeItem').key.should.equal(0);
    });

    it('should activate item', () => {
      instance.hoverHandler(1)();
      wrapper.should.have.state('activeIndex', 1);
      wrapper.state('activeItem').key.should.equal(1);
    });

    it('should reset activeIndex when it\'s changed in props', () => {
      instance.hoverHandler(1)();
      const activeIndex = 2;
      wrapper.setProps({
        activeIndex
      });
      wrapper.should.have.state('activeIndex', activeIndex);
      wrapper.state('activeItem').key.should.equal(activeIndex);
    });

    it('shouldn\'t reset activeIndex when it isn\'t changed in props', () => {
      instance.hoverHandler(1)();
      wrapper.setProps({
        activeIndex: 0
      });
      wrapper.should.have.state('activeIndex', 1);
      wrapper.state('activeItem').key.should.equal(1);
    });
  });

  describe('should render items', () => {
    const shallowFirstItem = instance =>
      shallow(instance.renderItem({index: 1}));
    const mountFirstItem = instance =>
      mount(instance.renderItem({index: 1}));

    it('should render for empty element', () => {
      const instance = shallowList({
        data: [
          {}
        ]
      }).instance();
      const firstItemWrapper = mountFirstItem(instance).find(ListItem);
      firstItemWrapper.should.have.className('ring-list__item_action');
      firstItemWrapper.should.have.text('');
    });

    it('should render instance item if type is not defined', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!'}
        ]
      }).instance();

      mount(instance.renderItem({index: 1})).should.have.descendants('.ring-list__item');
    });

    it('should render a if href defined', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!', href: 'http://www.jetbrains.com'}
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListLink);
      firstItemWrapper.should.exist;
      firstItemWrapper.should.have.className(linkStyles.link);
      firstItemWrapper.should.have.text('Hello!');
      firstItemWrapper.should.have.tagName('a');
      firstItemWrapper.should.have.attr('href', 'http://www.jetbrains.com');
    });

    it('should render a if url defined', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!', url: 'http://www.jetbrains.com'}
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListLink);
      firstItemWrapper.should.exist;
      firstItemWrapper.should.have.className(linkStyles.link);
      firstItemWrapper.should.have.text('Hello!');
      firstItemWrapper.should.have.tagName('a');
      firstItemWrapper.should.have.attr('href', 'http://www.jetbrains.com');
    });

    it('should render separator', () => {
      const instance = shallowList({
        data: [
          {rgItemType: List.ListProps.Type.SEPARATOR}
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListSeparator);
      firstItemWrapper.should.exist;
      firstItemWrapper.should.have.className('ring-list__separator');
    });

    it('should render title', () => {
      const instance = shallowList({
        data: [
          {rgItemType: List.ListProps.Type.TITLE, label: 'Foo', description: 'Bar'}
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListTitle);
      firstItemWrapper.should.exist;
      firstItemWrapper.should.have.text('FooBar');
    });

    it('should render pseudo link if link without href', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!', rgItemType: List.ListProps.Type.LINK}
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListLink);
      firstItemWrapper.should.exist;
      firstItemWrapper.should.have.className(linkStyles.link);
      firstItemWrapper.should.have.className(linkStyles.pseudo);
      firstItemWrapper.should.have.text('Hello!');
      firstItemWrapper.should.have.tagName('a');
    });

    it('should not render icon if not provided', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!', type: List.ListProps.Type.ITEM}
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListItem);
      firstItemWrapper.should.not.have.descendants('.ring-list__icon');
    });

    it('should render icon if provided', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!', icon: 'http://some.url/', type: List.ListProps.Type.ITEM}
        ]
      }).instance();

      const icon = mountFirstItem(instance).find('.ring-list__icon');
      icon.prop('style').backgroundImage.should.contain('http://some.url');
    });

    it('should render icon of a custom size', () => {
      const customIconSize = Icon.Size.Size12;
      const instance = shallowList({
        data: [
          {
            iconSize: customIconSize,
            label: 'Hello!',
            glyph: checkMarkIcon,
            type: List.ListProps.Type.ITEM
          }
        ]
      }).instance();

      const icon = mountFirstItem(instance).find(Icon);
      icon.should.have.prop('size', customIconSize);
    });

    it('should not render glyph if not provided', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!', type: List.ListProps.Type.ITEM}
        ]
      }).instance();

      mountFirstItem(instance).find('use').should.be.empty;
    });

    it('should render glyph if provided', () => {
      const instance = shallowList({
        data: [
          {label: 'Hello!', glyph: checkMarkIcon, type: List.ListProps.Type.ITEM}
        ]
      }).instance();

      mountFirstItem(instance).find(Icon).should.have.prop('glyph', checkMarkIcon);
    });

    it('should throw error on unknown type', () => {
      (() => {
        const instance = shallowList({
          data: [
            {label: 'Hello!', rgItemType: 'none'}
          ]
        }).instance();

        mountFirstItem(instance);
      }).should.throw(Error, 'Unknown menu element type: none');
    });

    it('should handle click', () => {
      const clicked = sandbox.stub();

      const instance = shallowList({
        data: [
          {label: 'Hello!', onClick: clicked}
        ]
      }).instance();

      const firstItemWrapper = shallowFirstItem(instance).find(ListItem);
      firstItemWrapper.simulate('click');
      clicked.should.have.been.called;
    });

    it('should handle select', () => {
      const onSelect = sandbox.stub();

      const instance = shallowList({
        onSelect,
        data: [{label: 'Hello!'}]
      }).instance();

      const firstItemWrapper = shallowFirstItem(instance).find(ListItem);
      firstItemWrapper.simulate('click');
      onSelect.should.have.been.called;
    });

    it('Should support custom elements', () => {
      const instance = shallowList({
        data: [
          {
            template: React.createElement('span', {}, 'custom item'),
            rgItemType: List.ListProps.Type.CUSTOM
          }
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListCustom);
      firstItemWrapper.should.have.text('custom item');
    });

    it('Should support click on custom elements', () => {
      const onClick = sandbox.stub();
      const instance = shallowList({
        data: [
          {
            template: React.createElement('span', {}, 'custom item'),
            rgItemType: List.ListProps.Type.CUSTOM,
            onClick
          }
        ]
      }).instance();

      const firstItemWrapper = shallowFirstItem(instance).find(ListCustom);
      firstItemWrapper.simulate('click');
      onClick.should.have.been.called;
    });

    it('Should support disable property for custom elements', () => {
      const instance = shallowList({
        data: [
          {
            template: React.createElement('span', {}, 'custom item'),
            rgItemType: List.ListProps.Type.CUSTOM,
            disabled: true
          }
        ]
      }).instance();

      const firstItemWrapper = mountFirstItem(instance).find(ListCustom);
      firstItemWrapper.should.not.have.className('ring-list__item_action');
    });
  });
});
