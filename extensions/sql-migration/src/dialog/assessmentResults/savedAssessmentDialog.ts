/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as constants from '../../constants/strings';
import { MigrationStateModel } from '../../models/stateMachine';
import { WizardController } from '../../wizard/wizardController';


export class SavedAssessmentDialog {

	private static readonly OkButtonText: string = 'Next';
	private static readonly CancelButtonText: string = 'Cancel';

	private _isOpen: boolean = false;
	private dialog: azdata.window.Dialog | undefined;
	private _rootContainer!: azdata.FlexContainer;
	private stateModel: MigrationStateModel;

	constructor(stateModel: MigrationStateModel) {
		this.stateModel = stateModel;
	}

	private async initializeDialog(dialog: azdata.window.Dialog): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			dialog.registerContent(async (view) => {
				try {
					this._rootContainer = this.initializePageContent(view);
					view.initializeModel(this._rootContainer);
					resolve();
				} catch (ex) {
					reject(ex);
				}
			});
		});
	}

	public async openDialog(dialogName?: string) {
		if (!this._isOpen) {
			this._isOpen = true;
			this.dialog = azdata.window.createModelViewDialog('Saved Assessment Result', 'Saved Assessment Result', '60%');

			this.dialog.okButton.label = SavedAssessmentDialog.OkButtonText;
			this.dialog.okButton.onClick(async () => await this.execute());

			this.dialog.cancelButton.label = SavedAssessmentDialog.CancelButtonText;
			this.dialog.cancelButton.onClick(async () => await this.cancel());

			const dialogSetupPromises: Thenable<void>[] = [];

			dialogSetupPromises.push(this.initializeDialog(this.dialog));

			azdata.window.openDialog(this.dialog);

			await Promise.all(dialogSetupPromises);
		}
	}

	protected async execute() {

		if (this.stateModel.resumeAssessment) {
			// load saved assessments here
			// stateModel.savedAssessment
			const wizardController = new WizardController(this.stateModel);
			await wizardController.openWizard(this.stateModel.sourceConnectionId);
			// set a lot of properties here
			console.log(this.stateModel.savedInfo.selectedDatabases);
			// this.stateModel._databaseAssessment = this.stateModel.savedInfo.selectedDatabases
		} else {
			// normal flow
			const wizardController = new WizardController(this.stateModel);
			await wizardController.openWizard(this.stateModel.sourceConnectionId);
		}
		this._isOpen = false;
	}

	protected async cancel() {
		this._isOpen = false;
	}

	public get isOpen(): boolean {
		return this._isOpen;
	}

	public initializePageContent(view: azdata.ModelView): azdata.FlexContainer {
		const buttonGroup = 'resumeMigration';

		const text = view.modelBuilder.text().withProps({
			CSSStyles: {
				'font-size': '18px',
				'font-weight': 'bold',
				'margin': '100px 8px 0px 36px'
			},
			value: constants.RESUME_TITLE
		}).component();

		const radioStart = view.modelBuilder.radioButton().withProps({
			label: constants.START_MIGRATION,
			name: buttonGroup,
			CSSStyles: {
				'font-size': '14px',
				'margin': '40px 8px 0px 36px'
			},
			checked: true
		}).component();

		radioStart.onDidChangeCheckedState((e) => {
			if (e) {
				this.stateModel.resumeAssessment = false;
			}
		});
		const radioContinue = view.modelBuilder.radioButton().withProps({
			label: constants.CONTINUE_MIGRATION,
			name: buttonGroup,
			CSSStyles: {
				'font-size': '14px',
				'margin': '10px 8px 0px 36px'
			},
			checked: false
		}).component();

		radioContinue.onDidChangeCheckedState((e) => {
			if (e) {
				this.stateModel.resumeAssessment = true;
			}
		});

		const flex = view.modelBuilder.flexContainer().withLayout({
			flexFlow: 'column',
			height: '100%',
			width: '100%'
		}).component();
		flex.addItem(text, { flex: '0 0 auto' });
		flex.addItem(radioStart, { flex: '0 0 auto' });
		flex.addItem(radioContinue, { flex: '0 0 auto' });

		return flex;
	}

}