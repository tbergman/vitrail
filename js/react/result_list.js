// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/result_list.js
// Purpose:                ResultList React components for Vitrail.
//
// Copyright (C) 2015 Christopher Antila
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//-------------------------------------------------------------------------------------------------


import React from 'react';
import {Link} from 'react-router';

import {SIGNALS as signals} from '../nuclear/signals';
import {reactor} from '../nuclear/reactor';
import {getters} from '../nuclear/getters';
import {ItemView} from './itemview';


var ResultColumn = React.createClass({
    propTypes: {
        // URL corresponding to "data," which will be used as the @href of an <a>. Optional.
        link: React.PropTypes.string,
        // Data to show in the column.
        data: React.PropTypes.string,
        // Whether this is a column in the table header (default is false).
        header: React.PropTypes.bool
    },
    getDefaultProps: function() {
        return {link: "", data: "", header: false};
    },
    render: function() {
        var post;
        if (this.props.link) {
            post = <a href={this.props.link}>{this.props.data}</a>;
        } else {
            post = this.props.data;
        }
        if (this.props.header) {
            post = <th>{post}</th>;
        } else {
            post = <td>{post}</td>;
        }
        return post;
    }
});

var Result = React.createClass({
    propTypes: {
        // the column names to render, or the fields in "data" to render as columns
        columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        // the object to render into columns
        data: React.PropTypes.object.isRequired,
        // members here are the URL for the same-name member in "data"
        resources: React.PropTypes.object
    },
    getDefaultProps: function() {
        return {resources: {}};
    },
    render: function() {
        var renderedColumns = [];
        this.props.columns.forEach(function (columnName) {
            var columnData = this.props.data[columnName];
            if (columnData !== undefined) {
                columnData = columnData.toString();
            }

            var columnLink = '';
            if ("name" === columnName)
                columnLink = this.props.resources['self'];
            else {
                columnLink = this.props.resources[columnName];
            }

            renderedColumns.push(<ResultColumn key={columnName} data={columnData} link={columnLink} />);
        }, this);
        if (this.props.data["drupal_path"] !== undefined) {
            renderedColumns.push(<ResultColumn key="drupal_path" data="Show" link={this.props.data["drupal_path"]} />);
        }
        return (
            <tr className="resultComponent">
                {renderedColumns}
            </tr>
        );
    }
});


/** ResultList sub-component that produces some ItemView elements.
 *
 * Props:
 * - data
 * - sortOrder
 */
const ResultListItemView = React.createClass({
    propTypes: {
        data: React.PropTypes.object,
        sortOrder: React.PropTypes.arrayOf(React.PropTypes.string),
    },
    getDefaultProps() {
        return {data: null, sortOrder: []};
    },
    render() {
        return (
            <div className="card-columns">
                {this.props.sortOrder.map(function(rid) {
                    return <ItemView
                        key={rid}
                        size="compact"
                        data={this.props.data[rid]}
                        resources={this.props.data.resources[rid]}
                        />;
                    }.bind(this)
                )}
            </div>
        );
    },
});


/** ResultList sub-component that produces a table.
 *
 * Props:
 * - headers
 * - data
 * - dontRender
 * - sortOrder
 */
const ResultListTable = React.createClass({
    propTypes: {
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        data: React.PropTypes.object,
        headers: React.PropTypes.object,
        sortOrder: React.PropTypes.arrayOf(React.PropTypes.string),
    },
    getDefaultProps: function() {
        return {dontRender: [], data: null, headers: null, sortOrder: []};
    },
    render() {
        let tableHeader = [];
        let columns = this.props.headers.fields.split(',');
        let extraFields = this.props.headers.extra_fields;
        if (null !== extraFields) {
            extraFields = extraFields.split(',');
            columns = columns.concat(extraFields);
        }

        // remove the field names in "dontRender"
        for (let field in this.props.dontRender) {
            let pos = columns.indexOf(this.props.dontRender[field]);
            if (pos >= 0) {
                columns.splice(pos, 1);
            }
        };

        columns.forEach(function(columnName) {
            // first we have to change field names from, e.g., "indexing_notes" to "Indexing notes"
            let working = columnName.split("_");
            let polishedName = "";
            for (let i in working) {
                let rawr = working[i][0];
                rawr = rawr.toLocaleUpperCase();
                polishedName += rawr;
                polishedName += working[i].slice(1) + " ";
            }
            polishedName = polishedName.slice(0, polishedName.length);

            // now we can make the <th> cell itself
            tableHeader.push(<ResultColumn key={columnName} data={polishedName} header={true} />);
        });

        let results = [];
        this.props.sortOrder.forEach(function (id) {
            results.push(<Result
                key={id}
                columns={columns}
                data={this.props.data[id]}
                resources={this.props.data.resources[id]} />);
        }, this);

        return (
            <table className="table table-hover">
                <thead>
                    <tr className="resultTableHeader">
                        {tableHeader}
                    </tr>
                </thead>
                <tbody>
                    {results}
                </tbody>
            </table>
        );
    },
});


// TODO: move the NuclearJS stuff from ResultListFrame to ResultList
// TODO: make ResultList and children use ImmutableJS objects directly
var ResultList = React.createClass({
    //
    // Props:
    // - dontRender
    // - data
    // - headers
    // - sortOrder
    //
    // NuclearJS State:
    // - searchResultsFormat (str) Whether to render the results in a "table" or with "ItemView" components.
    //

    propTypes: {
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        data: React.PropTypes.object,
        headers: React.PropTypes.object,
        // the order in which to display results
        sortOrder: React.PropTypes.arrayOf(React.PropTypes.string),
    },
    getDefaultProps: function() {
        return {dontRender: [], data: null, headers: null, sortOrder: []};
    },
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {searchResultsFormat: getters.searchResultsFormat};
    },
    render: function() {
        let results;

        // skip the content creation if it's just the initial data (i.e., nothing useful)
        if (null !== this.props.data && null !== this.props.headers) {
            if ('table' === this.state.searchResultsFormat) {
                results = <ResultListTable dontRender={this.props.dontRender}
                                           data={this.props.data}
                                           headers={this.props.headers}
                                           sortOrder={this.props.sortOrder}/>;
            } else {
                results = <ResultListItemView data={this.props.data} sortOrder={this.props.sortOrder}/>;
            }
        }

        return (
            <div className="resultList card">
                <div className="card-block">
                    <h2 className="card-title">Results</h2>
                </div>
                {results}
            </div>
        );
    }
});

var Paginator = React.createClass({
    //
    // State:
    // - page (int) Current page in the search results.
    // - totalPages (int) Total number of result pages.
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            page: getters.searchResultsPage,
            totalPages: getters.searchResultsPages,
        };
    },
    changePage: function(button) {
        // Determine which page-change button was clicked then emit the setPage() signal.
        //

        let newPage = this.state.page;

        switch (button.target.value) {
            case 'previous':
                newPage -= 1;
                break;
            case 'next':
                newPage += 1;
                break;
            case 'first':
                newPage = 1;
                break;
            case 'last':
                newPage = this.state.totalPages;
                break;
        }

        if (newPage < 1 || newPage > this.state.totalPages) { /* do nothing! */ }
        else { signals.setPage(newPage); signals.submitSearchQuery(); }
    },
    render: function() {
        return (
            <div className="btn-group paginator" role="group" aria-label="paginator">
                <button type="button" className="btn btn-secondary" name="pages"
                        value="first" onClick={this.changePage}>&lt;&lt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="previous" onClick={this.changePage}>&lt;</button>
                <button type="button" className="blankOfBlank btn btn-secondary">
                    {this.state.page} of {this.state.totalPages}
                </button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="next" onClick={this.changePage}>&gt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="last" onClick={this.changePage}>&gt;&gt;</button>
            </div>
        );
    }
});


var PerPageSelector = React.createClass({
    // Allows users to choose the number of search results shown on a page.
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {perPage: getters.searchResultsPerPage};
    },
    onChange(event) {
        signals.setPerPage(Number(event.target.value));
        signals.submitSearchQuery();
    },
    render: function() {
        // NOTE: the <div> down there only exists to help keep the <input> within col-sm-10
        return (
            <fieldset className="form-group row">
                <label htmlFor="#perPageSelector" className="col-sm-2">Results per page:</label>
                <div className="col-sm-10">
                    <input type="number"
                           name="perPage"
                           id="perPageSelector"
                           className="form-control form-control-number"
                           value={this.state.perPage}
                           onChange={this.onChange}
                           />
                </div>
            </fieldset>
        );
    }
});


/** Radio button group for the "SearchResultsFormat" Store.
 */
const RenderAsSelector = React.createClass({
    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {format: getters.searchResultsFormat};
    },
    onChange(event) {
        signals.setSearchResultsFormat(event.target.value);
    },
    render() {
        let viewChecked = false;
        let tableChecked = false;

        if ('table' === this.state.format) {
            tableChecked = true;
        } else {
            viewChecked = true;
        }

        return (
            <form>
                <div className="radio">
                    <label>
                        <input type="radio" name="renderAs" id="renderAsView" value="ItemView"
                               checked={viewChecked} onChange={this.onChange}/>
                        Render as Views
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" name="renderAs" id="renderAsTable" value="table"
                               checked={tableChecked} onChange={this.onChange}/>
                        Render as a Table
                    </label>
                </div>
            </form>
        );
    }
});


var ErrorMessage = React.createClass({
    //

    propTypes: {
        code: React.PropTypes.number,
        reason: React.PropTypes.string,
        response: React.PropTypes.string,
    },
    render() {
        let alertType = 'warning';
        let message = '';

        if (404 === this.props.code) {
            message = <p>The search returned no results.</p>;
        } else if (502 === this.props.code) {
            message = (
                <div>
                    <p>
                        Part of the CANTUS server is not working. You may try the same search
                        again in a few minutes, but it may also be a programming error.
                    </p>
                    <p>
                        Technical information: Abbot returned 502.
                    </p>
                </div>
            );
        } else if (this.props.code < 500) {
            alertType = 'danger';
            message = (
                <div>
                    <strong>Client Error</strong>
                    <p>This probably means that something in the browser made a mistake.</p>
                    <p>Technical information: {this.props.response}</p>
                </div>
            );
        } else {
            alertType = 'danger';
            message = (
                <div>
                    <strong>Server Error</strong>
                    <p>This probably means that something in the server made a mistake.</p>
                    <p>Technical information: {this.props.response}</p>
                </div>
            );
        }

        alertType = `alert alert-${alertType}`;
        return <div className={alertType}>{message}</div>;
    },
});


var ResultListFrame = React.createClass({
    //

    mixins: [reactor.ReactMixin],  // connection to NuclearJS
    getDataBindings() {
        // connection to NuclearJS
        return {
            results: getters.searchResults,
            error: getters.searchError,
        };
    },
    render: function() {

        let errorMessage = '';
        if (null !== this.state.error) {
            errorMessage = <ErrorMessage code={this.state.error.get('code')}
                                         reason={this.state.error.get('reason')}
                                         response={this.state.error.get('response')}
                                         />;
        }

        let results = '';
        if (null !== this.state.results) {
            results = <ResultList data={this.state.results.toJS()}
                                  headers={this.state.results.get('headers').toJS()}
                                  dontRender={this.props.dontRender}
                                  sortOrder={this.state.results.get('sort_order').toJS()}/>
        }

        return (
            <div className="resultListFrame">
                {errorMessage}
                {results}
                <Paginator/>
                <PerPageSelector/>
                <RenderAsSelector/>
            </div>
        );
    }
});


export {ResultListFrame};
export default ResultListFrame;
