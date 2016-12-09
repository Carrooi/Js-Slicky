import {SelectorParser, SelectorType, SelectorItem, ChildType, ElementSelector} from '../Parsers/SelectorParser';
import {ElementToken, AttributeToken} from '../Parsers/HTMLParser';


export class QuerySelector
{


	public static match(query: string, node: ElementToken, parentBoundary?: ElementToken): boolean
	{
		let s = SelectorParser.parse(query);
		let current = node;
		let previous = current;
		let previousItem: ElementSelector;

		for (let i = s.length - 1; i >= 0; i--) {
			let item = s[i];

			if (!current && previousItem) {
				current = QuerySelector.getParent(previous, item.selectors, previousItem.childType === ChildType.Direct, parentBoundary);
			}

			if (!current) {
				return false;
			}

			if (!QuerySelector.compareNodeWithSelectors(current, item.selectors)) {
				return false;
			}

			previousItem = item;
			previous = current;
			current = null;
		}

		return true;
	}


	private static compareNodeWithSelectors(node: ElementToken, selectors: Array<SelectorItem>): boolean
	{
		for (let j = 0; j < selectors.length; j++) {
			let selector = selectors[j];

			if (!QuerySelector.compareNodeWithSelector(node, selector)) {
				return false;
			}
		}

		return true;
	}


	private static compareNodeWithSelector(node: ElementToken, selector: SelectorItem): boolean
	{
		let findAttribute = (name: string): AttributeToken => {
			for (let attribute in node.attributes) {
				if (node.attributes.hasOwnProperty(attribute)) {
					if (node.attributes[attribute].name === name || node.attributes[attribute].originalName === name) {
						return node.attributes[attribute];
					}
				}
			}

			return null
		};

		switch (selector.type) {
			case SelectorType.Element:
				if (selector.value !== node.name) {
					return false;
				}

				break;
			case SelectorType.Id:
				if (typeof node.attributes['id'] === 'undefined' || node.attributes['id'].value !== selector.value) {
					return false;
				}

				break;
			case SelectorType.Class:
				if (typeof node.attributes['class'] === 'undefined' || node.attributes['class'].value.split(' ').indexOf(<string>selector.value) === -1) {
					return false;
				}

				break;
			case SelectorType.Attribute:
				let selectorValue = (<any>selector.value).value;
				let attribute = findAttribute((<any>selector.value).name);

				if (attribute === null) {
					return false;
				}

				if (selectorValue !== null && selectorValue !== attribute.value) {
					return false;
				}

				break;
		}

		return true;
	}


	private static getParent(node: ElementToken, selectors: Array<SelectorItem>, direct: boolean = false, parentBoundary?: ElementToken): ElementToken
	{
		let current = node.parent;

		if (current === null) {
			return null;
		}

		if (parentBoundary && current === parentBoundary) {
			return null;
		}

		if (direct) {
			return QuerySelector.compareNodeWithSelectors(current, selectors) ? current : null;
		}

		while (current) {
			if (parentBoundary && current === parentBoundary) {
				return null;
			}

			if (QuerySelector.compareNodeWithSelectors(current, selectors)) {
				return current;
			}

			current = current.parent;
		}

		return null;
	}

}
