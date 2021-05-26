import NoteContextAwareWidget from "../note_context_aware_widget.js";
import utils from "../../services/utils.js";

const TPL = `
<div class="dropdown note-actions">
    <style>
    .note-actions-button {
        font-size: 120% !important;
    }
    
    .note-actions-button::after {
        display: none !important; // disabling the standard caret
    }
    
    .note-actions .dropdown-menu {
        width: 15em;
    }
    
    .note-actions .dropdown-item[disabled], .note-actions .dropdown-item[disabled]:hover {
        color: var(--muted-text-color) !important;
        background-color: transparent !important;
        pointer-events: none; /* makes it unclickable */
    }
    </style>

    <button type="button" data-toggle="dropdown" aria-haspopup="true" 
        aria-expanded="false" class="note-actions-button btn btn-sm dropdown-toggle bx bx-dots-vertical-rounded"></button>

    <div class="dropdown-menu dropdown-menu-right">
        <a data-trigger-command="renderActiveNote" class="dropdown-item render-note-button"><kbd data-command="renderActiveNote"></kbd> Re-render note</a>
        <a data-trigger-command="findInText" class="dropdown-item">Search in note <kbd data-command="findInText"></a>
        <a data-trigger-command="showNoteRevisions" class="dropdown-item show-note-revisions-button">Revisions</a>
        <a data-trigger-command="showLinkMap" class="dropdown-item show-link-map-button"><kbd data-command="showLinkMap"></kbd> Link map</a>
        <a data-trigger-command="showNoteSource" class="dropdown-item show-source-button"><kbd data-command="showNoteSource"></kbd> Note source</a>
        <a data-trigger-command="openNoteExternally" class="dropdown-item open-note-externally-button"><kbd data-command="openNoteExternally"></kbd> Open note externally</a>
        <a class="dropdown-item import-files-button">Import files</a>
        <a class="dropdown-item export-note-button">Export note</a>
        <a data-trigger-command="printActiveNote" class="dropdown-item print-note-button"><kbd data-command="printActiveNote"></kbd> Print note</a>
        <a data-trigger-command="showNoteInfo" class="dropdown-item show-note-info-button"><kbd data-command="showNoteInfo"></kbd> Note info</a>
    </div>
</div>`;

export default class NoteActionsWidget extends NoteContextAwareWidget {
    doRender() {
        this.$widget = $(TPL);
        this.overflowing();

        this.$showSourceButton = this.$widget.find('.show-source-button');
        this.$renderNoteButton = this.$widget.find('.render-note-button');

        this.$exportNoteButton = this.$widget.find('.export-note-button');
        this.$exportNoteButton.on("click", () => {
            if (this.$exportNoteButton.hasClass("disabled")) {
                return;
            }

            import('../../dialogs/export.js').then(d => d.showDialog(this.noteContext.notePath, 'single'));
        });

        this.$importNoteButton = this.$widget.find('.import-files-button');
        this.$importNoteButton.on("click", () => import('../../dialogs/import.js').then(d => d.showDialog(this.noteId)));

        this.$widget.on('click', '.dropdown-item',
            () => this.$widget.find('.dropdown-toggle').dropdown('toggle'));

        this.$openNoteExternallyButton = this.$widget.find(".open-note-externally-button");
    }

    refreshWithNote(note) {
        this.toggleDisabled(this.$showSourceButton, ['text', 'relation-map', 'search', 'code'].includes(note.type));

        this.$renderNoteButton.toggle(note.type === 'render');

        this.$openNoteExternallyButton.toggle(utils.isElectron());
    }

    toggleDisabled($el, enable) {
        if (enable) {
            $el.removeAttr('disabled');
        } else {
            $el.attr('disabled', 'disabled');
        }
    }

    entitiesReloadedEvent({loadResults}) {
        if (loadResults.isNoteReloaded(this.noteId)) {
            this.refresh();
        }
    }
}