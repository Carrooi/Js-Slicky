import {PluralForms} from './PluralForms';
import {Injectable} from '../DI/Metadata';
import {ComponentView} from '../Views/ComponentView';
import {Code} from '../Util/Code';
import {Helpers} from '../Util/Helpers';
import {VariableParser} from '../Parsers/VariableParser';


export declare interface ParamsList
{
	[key: string]: any;
}


@Injectable()
export class Translator
{


	public locale: string;

	private pluralForms = PluralForms;


	public translate(view: ComponentView, msg: string, count: number = null, params: ParamsList = {}): string
	{
		if (typeof msg !== 'string') {
			return msg;
		}

		if (!this.locale) {
			throw new Error('You have to set current locale before using translator.');
		}

		if (typeof view.translations[this.locale] === 'undefined') {
			return msg;
		}

		let variable = VariableParser.parse(msg);
		let obj = Code.interpolateObjectElement(view.translations[this.locale], variable);

		if (typeof obj.obj[obj.key] === 'undefined') {
			return msg;
		}

		let translation = obj.obj[obj.key];

		if (Helpers.isArray(translation)) {
			if (count === null) {
				translation = translation[0];

			} else if (typeof this.pluralForms[this.locale] === 'undefined') {
				throw new Error('Can not get plural form for message ' + msg + ' because locale ' + this.locale + ' does not have known plural forms.');

			} else {
				params['count'] = count;

				let n = count;
				let plural: number = null;

				eval('plural = +(' + this.pluralForms[this.locale].form + ');');

				translation = typeof translation[plural] !== 'undefined' ?
					translation[plural] :
					translation[0]
				;
			}


		}

		translation = this.applyReplacements(translation, params);

		return translation;
	}


	private applyReplacements(message: string, replacements: {[name: string]: any}): string
	{
		for (let name in replacements) {
			if (replacements.hasOwnProperty(name) && replacements[name] !== false) {
				let pattern = new RegExp('%' + name + '%', 'g');
				message = message.replace(pattern, replacements[name]);
			}
		}

		return message;
	}

}
