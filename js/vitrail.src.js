// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/vitrail.src.js
// Purpose:                Core React components for Vitrail.
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


import React from "react";
import cantusModule from "./cantusjs/cantus.src";


// Utility Functions ==============================================================================
function encloseWithQuotes(query) {
    // Given a string with a search query, remove surrounding whitespace. Then if there is a space
    // character in the string, ensure the first and last characters are a double quote.

    query = query.trim();
    if (query.includes(' ')) {
        if ('"' !== query.slice(0, 1)) {
            query = '"' + query;
        }
        if ('"' !== query.slice(-1)) {
            query = query + '"';
        }
    }
    return query
};


// React Components ===============================================================================

var SearchBox = React.createClass({
    propTypes: {
        // "contents" is the initial value in the search box
        contents: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {contents: ""};
    },
    // submitSearch: function(changeEvent) {
        // this.props.submitSearch(changeEvent.target[0].value);
        // changeEvent.preventDefault();  // stop the default GET form submission
    // },
    render: function() {
        return (
            <fieldset className="form-group row">
                <label htmlFor="#searchQuery" className="col-sm-2">Search Query</label>
                <div className="input-group col-sm-10">
                    <input id="searchQuery" type="search" className="form-control form-control-search" defaultValue={this.props.contents}/>
                    <span className="input-group-btn">
                        <button className="btn btn-secondary" type="submit" value="Search">Search</button>
                    </span>
                </div>
            </fieldset>
        );
    }
});

var TypeRadioButton = React.createClass({
    propTypes: {
        value: React.PropTypes.string.isRequired,
        onUserInput: React.PropTypes.func.isRequired,
        selected: React.PropTypes.bool,
        label: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {selected: false, label: ""};
    },
    render: function() {
        let thisId = `typeRadioButton-${this.props.value}`;
        return (
            <div className="radio">
                <input type="radio" name="resourceType" id={thisId} value={this.props.value}
                       onChange={this.handleChange} checked={this.props.selected} />
                <label htmlFor={thisId}>
                    {this.props.label}
                </label>
            </div>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var TypeSelector = React.createClass({
    propTypes: {
        // "types" is an array of 2-element array of strings. In the sub-arrays, the first element
        // should be the name of the type, for use in the UI; the second element should be the name
        // of the member as it's held in the HATEOAS resource URLs provided by the Cantus server.
        types: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)),
        // Name of the currently selected type, as it appears in the second element of the sub-array
        // described in "types."
        selectedType: React.PropTypes.string,
        // This function is executed when the user selects a different type. There is one argument,
        // a string with the name of the newly-selected type, as it appears in the second element
        // of the sub-array described in "types."
        onUserInput: React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return {types: [], selectedType: ""};
    },
    render: function() {
        var renderedButtons = [];
        this.props.types.forEach(function (buttonDeets, index) {
            var selected = false;
            if (this.props.selectedType === buttonDeets[1]) {
                selected = true;
            }
            renderedButtons.push(<TypeRadioButton label={buttonDeets[0]}
                                                  value={buttonDeets[1]}
                                                  onUserInput={this.props.onUserInput}
                                                  selected={selected}
                                                  key={index}
                                 />);
        }, this);
        return  (
            <fieldset className="typeSelector form-group row">
                <label className="col-sm-2">Resource Type</label>
                <div className="col-sm-10">
                    {renderedButtons}
                </div>
            </fieldset>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

var PerPageSelector = React.createClass({
    propTypes: {
        onUserInput: React.PropTypes.func.isRequired,
        perPage: React.PropTypes.number
    },
    getDefaultProps: function() {
        return {perPage: 10};
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
                           value={this.props.perPage}
                           onChange={this.handleChange}
                           />
                </div>
            </fieldset>
        );
    },
    handleChange: function(changeEvent) {
        this.props.onUserInput(changeEvent.target.value);
    }
});

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

var ResultList = React.createClass({
    propTypes: {
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        data: React.PropTypes.object,
        headers: React.PropTypes.object,
        // the order in which to display results
        sortOrder: React.PropTypes.arrayOf(React.PropTypes.string)
    },
    getDefaultProps: function() {
        return {dontRender: [], data: null, headers: null};
    },
    render: function() {
        var tableHeader = [];
        var results = [];

        // skip the content creation if it's just the initial data (i.e., nothing useful)
        if (null !== this.props.data && null !== this.props.headers) {
            var columns = this.props.headers.fields.split(',');
            var extraFields = this.props.headers.extra_fields;
            if (null !== extraFields) {
                extraFields = extraFields.split(',');
                columns = columns.concat(extraFields);
            }

            // remove the field names in "dontRender"
            for (var field in this.props.dontRender) {
                var pos = columns.indexOf(this.props.dontRender[field]);
                if (pos >= 0) {
                    columns.splice(pos, 1);
                }
            };

            columns.forEach(function(columnName) {
                // first we have to change field names from, e.g., "indexing_notes" to "Indexing notes"
                var working = columnName.split("_");
                var polishedName = "";
                for (var i in working) {
                    var rawr = working[i][0];
                    rawr = rawr.toLocaleUpperCase();
                    polishedName += rawr;
                    polishedName += working[i].slice(1) + " ";
                }
                polishedName = polishedName.slice(0, polishedName.length);

                // now we can make the <th> cell itself
                tableHeader.push(<ResultColumn key={columnName} data={polishedName} header={true} />);
            });

            this.props.sortOrder.forEach(function (id) {
                results.push(<Result
                    key={id}
                    columns={columns}
                    data={this.props.data[id]}
                    resources={this.props.data.resources[id]} />);
            }, this);
        }

        return (
            <div className="resultList card">
                <div className="card-block">
                    <h2 className="card-title">Results</h2>
                </div>
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
            </div>
        );
    }
});

var Paginator = React.createClass({
    propTypes: {
        changePage: React.PropTypes.func.isRequired,
        currentPage: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        totalPages: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        searchQuery: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {currentPage: 1, totalPages: 1};
    },
    changePage: function(button) {
        this.props.changePage(button.target.value);
    },
    render: function() {
        return (
            <div className="btn-group paginator" role="group" aria-label="paginator">
                <button type="button" className="btn btn-secondary" name="pages"
                        value="first" onClick={this.changePage}>&lt;&lt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="previous" onClick={this.changePage}>&lt;</button>
                <button type="button" className="blankOfBlank btn btn-secondary">
                    {this.props.currentPage} of {this.props.totalPages}
                </button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="next" onClick={this.changePage}>&gt;</button>
                <button type="button" className="btn btn-secondary" name="pages"
                        value="last" onClick={this.changePage}>&gt;&gt;</button>
            </div>
        );
    }
});

var ResultListFrame = React.createClass({
    propTypes: {
        changePage: React.PropTypes.func.isRequired,
        resourceType: React.PropTypes.string,
        dontRender: React.PropTypes.arrayOf(React.PropTypes.string),
        perPage: React.PropTypes.number,
        page: React.PropTypes.number,
        searchQuery: React.PropTypes.string,
        cantus: React.PropTypes.object,

        // When the "searchQuery" is empty and "doGenericGet" is true, this component renders the
        // results of a GET to the resource-type-specific URL. This is true by default.
        doGenericGet: React.PropTypes.bool
    },
    getDefaultProps: function() {
        return {resourceType: "any", dontRender: [], doGenericGet: true};
    },
    getNewData: function(resourceType, requestPage, perPage, searchQuery) {
        // default, unchanging things
        var ajaxSettings = {
            type: resourceType
        };

        // TODO: id, fields, sort

        // pagination
        if (undefined === requestPage) {
            ajaxSettings["page"] = 1;
        } else {
            ajaxSettings["page"] = requestPage;
        }

        if (undefined === perPage) {
            ajaxSettings["per_page"] = 10;
        } else {
            ajaxSettings["per_page"] = perPage;
        }

        // submit the request
        if (undefined !== searchQuery && "" !== searchQuery) {
            // search query
            ajaxSettings["any"] = searchQuery;
            this.props.cantus.search(ajaxSettings).then(this.ajaxSuccessCallback).catch(this.ajaxFailureCallback);
        } else if (this.props.doGenericGet) {
            // browse query
            this.props.cantus.get(ajaxSettings).then(this.ajaxSuccessCallback).catch(this.ajaxFailureCallback);
        } else {
            // Since this function is only called if the query-affecting parameters are changed,
            // we know it's safe at this point to clear the state that's displayed. If we didn't
            // reset our "state," the displayed data would not correspond to our new props.
            this.setState(this.getInitialState);
        }
    },
    ajaxSuccessCallback: function(response) {
        // Called when an AJAX request returns successfully.
        var headers = response.headers;
        delete response.headers;
        var sortOrder = response.sort_order;
        delete response.sort_order;
        var totalPages = Math.ceil(headers.total_results / headers.per_page);
        this.setState({data: response, headers: headers, page: headers.page, totalPages: totalPages,
                       sortOrder: sortOrder});
    },
    ajaxFailureCallback: function(response) {
        // Called when an AJAX request returns unsuccessfully.
        if (404 === response.code) {
            this.setState({errorMessage: 404});
        } else {
            this.setState({errorMessage: response.response});
        }
    },
    componentDidMount: function() { this.getNewData(this.props.resourceType); },
    componentWillReceiveProps: function(newProps) {
        // check "perPage" is valid
        if (newProps.perPage < 1 || newProps.perPage > 100) {
            return;
        }
        // check if "page" is "last"
        else if ("last" === newProps.page) {
            this.props.changePage(this.state.totalPages);
        }
        // check if "page" is valid
        else if (newProps.page > this.state.totalPages) {
            this.props.changePage(this.state.totalPages);
        }
        // if the Cantus API query will be different, submit a new query
        else if (newProps.resourceType !== this.props.resourceType ||
                 newProps.searchQuery  !== this.props.searchQuery  ||
                 newProps.perPage      !== this.props.perPage      ||
                 newProps.page         !== this.props.page) {
            this.setState({errorMessage: null});
            this.getNewData(newProps.resourceType,
                            newProps.page,
                            newProps.perPage,
                            newProps.searchQuery);
        }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        // this will always change the output
        if (nextState.errorMessage !== this.state.errorMesssage) {
            return true;
        // we'll get another props change in a moment
        } else if ("last" === nextProps.page) {
            return false;
        // this would produce an invalid result
        } else if (nextProps.page > this.state.totalPages) {
            return false;
        // this wouldn't change anything
        } else if (nextState.data === this.state.data && nextState.headers === this.state.headers &&
                   nextState.page === this.state.page && nextState.totalPages === this.state.totalPages) {
            return false;
        } else {
            return true;
        }
    },
    getInitialState: function() {
        return {data: null, headers: null, page: 1, totalPages: 1, errorMessage: null};
    },
    render: function() {
        var currentPage = this.state.page;
        var totalPages = this.state.totalPages;

        if (null === this.state.errorMessage) {
            return (
                <div className="resultListFrame">
                    <ResultList data={this.state.data}
                                headers={this.state.headers}
                                dontRender={this.props.dontRender}
                                sortOrder = {this.state.sortOrder} />
                    <Paginator changePage={this.props.changePage} currentPage={this.state.page} totalPages={this.state.totalPages} />
                </div>
            );
        } else {
            let errorMessage = '';
            if (null !== this.state.errorMessage) {
                if (404 == this.state.errorMessage) {
                    errorMessage = <div className="alert alert-warning">No results were found for your search.</div>;
                } else {
                    errorMessage = <div className="alert alert-danger"><strong>Error:&nbsp;</strong>{this.state.errorMessage}</div>;
                }
            }

            return (
                <div className="resultListFrame">
                    {errorMessage}
                </div>
            );
        }
    }
});


var BasicSearch = React.createClass({
    propTypes: {
        cantusjs: React.PropTypes.object.isRequired,
    },
    getInitialState: function() {
        return {resourceType: 'all', page: 1, perPage: 10, currentSearch: '', errorMessage: null};
    },
    failedAjaxRequest: function(errorInfo) {
        // when an AJAX request fails

        // 1.) was there a 404, meaning no search results were found?
        if (404 === errorInfo.code) {
            this.setState({errorMessage: "No results were found."});
        }

        // 2.) otherwise there was another failure
        else {
            var errorMessage = "There was an error while contacting the CANTUS server:\n" + errorInfo.response;
            console.error(errorInfo);
            this.setState({errorMessage: errorMessage});
        }
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page. Or supply a page number directly.
        var newPage = 1;
        var curPage = this.state.page;

        if ("next" === direction) {
            newPage = curPage + 1;
        } else if ("previous" === direction) {
            if (curPage > 1) {
                newPage = curPage - 1;
            }
        } else if ("first" === direction) {
            // it's already 1
        } else if ("last" === direction) {
            newPage = "last";
        } else {
            newPage = direction;
        }

        this.setState({page: newPage, errorMessage: null});
    },
    changePerPage: function(newPerPage) { this.setState({perPage: newPerPage, page: 1, errorMessage: null}); },
    changeResourceType: function(resourceType) {
        this.setState({resourceType: resourceType, currentSearch: "", page: 1, errorMessage: null});
    },
    submitSearch: function(submitEvent) {
        submitEvent.preventDefault();  // stop the default GET form submission
        this.setState({currentSearch: submitEvent.target[1].value,
                       page: 1,
                       errorMessage: null});
    },
    render: function() {
        var mainScreen = null;

        // the resource types to allow searching for
        var types = [
            ['Any Type', 'all'],
            ['Cantus ID', 'cantusids'],
            ['Centuries', 'centuries'],
            ['Chants', 'chants'],
            ['Feasts', 'feasts'],
            ['Genres', 'genres'],
            ['Indexers', 'indexers'],
            ['Notations', 'notations'],
            ['Offices', 'offices'],
            ['Provenances', 'provenances'],
            ['RISM Sigla', 'sigla'],
            ['Segments', 'segments'],
            ['Sources', 'sources'],
            ['Source Status', 'source_statii']
        ];
        // fields that shouldn't be rendered for users
        // NB: this must be done before the call to the <ResultListFrame> component
        var dontRender = ['type', 'id'];
        if ('browse' === this.state.resourceType) {
            // if there may be many types, we want users to know what they're getting
            dontRender = ['id'];
        }

        // the server is compatible, but there was another error
        else if (null !== this.state.errorMessage) {
            mainScreen = (<p>{this.state.errorMessage}</p>);
        }

        // otherwise we'll show the usual thing
        else {
            mainScreen = (<ResultListFrame resourceType={this.state.resourceType}
                                           dontRender={dontRender}
                                           perPage={this.state.perPage}
                                           page={this.state.page}
                                           searchQuery={this.state.currentSearch}
                                           changePage={this.changePage}
                                           onError={this.failedAjaxRequest}
                                           cantus={this.props.cantusjs}
            />);
        }

        // do the rendering
        return (
            <div className="searchForm col-sm-12">
                <div className="searchSettings card">
                    <div className="card-block">
                        <h2 className="card-title">Query Settings</h2>
                    </div>
                    <form onSubmit={this.submitSearch}>
                        <SearchBox contents={this.state.currentSearch} />
                        <TypeSelector onUserInput={this.changeResourceType}
                                      types={types}
                                      selectedType={this.state.resourceType} />
                        <PerPageSelector onUserInput={this.changePerPage} perPage={this.state.perPage} />
                    </form>
                </div>
                <div className="searchResults">
                    {mainScreen}
                </div>
            </div>
        );
    }
});


var OneboxSearch = React.createClass({
    propTypes: {
        cantusjs: React.PropTypes.object.isRequired,
    },
    getInitialState: function() {
        return {page: 1, perPage: 10, currentSearch: '', errorMessage: null};
    },
    failedAjaxRequest: function(errorInfo) {
        // when an AJAX request fails

        // 1.) was there a 404, meaning no search results were found?
        if (404 === errorInfo.code) {
            this.setState({errorMessage: "No results were found."});
        }

        // 2.) otherwise there was another failure
        else {
            var errorMessage = "There was an error while contacting the CANTUS server:\n" + errorInfo.response;
            console.error(errorInfo);
            this.setState({errorMessage: errorMessage});
        }
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page. Or supply a page number directly.
        var newPage = 1;
        var curPage = this.state.page;

        if ("next" === direction) {
            newPage = curPage + 1;
        } else if ("previous" === direction) {
            if (curPage > 1) {
                newPage = curPage - 1;
            }
        } else if ("first" === direction) {
            // it's already 1
        } else if ("last" === direction) {
            newPage = "last";
        } else {
            newPage = direction;
        }

        this.setState({page: newPage, errorMessage: null});
    },
    changePerPage: function(newPerPage) { this.setState({perPage: newPerPage, page: 1, errorMessage: null}); },
    changeResourceType: function(resourceType) {
        this.setState({resourceType: resourceType, currentSearch: "", page: 1, errorMessage: null});
    },
    submitSearch: function(submitEvent) {
        submitEvent.preventDefault();  // stop the default GET form submission
        this.setState({currentSearch: submitEvent.target[1].value,
                       page: 1,
                       errorMessage: null});
    },
    render: function() {
        let mainScreen = null;

        // fields that shouldn't be rendered for users
        // NB: this must be done before the call to the <ResultListFrame> component
        let dontRender = ['id'];

        // if there's an error, show an error message
        if (null !== this.state.errorMessage) {
            mainScreen = (<p>{this.state.errorMessage}</p>);
        }

        // otherwise we'll show the usual thing
        else {
            mainScreen = (<ResultListFrame resourceType='all'
                                           dontRender={dontRender}
                                           perPage={this.state.perPage}
                                           page={this.state.page}
                                           searchQuery={this.state.currentSearch}
                                           changePage={this.changePage}
                                           onError={this.failedAjaxRequest}
                                           cantus={this.props.cantusjs}
            />);
        }

        // do the rendering
        return (
            <div className="searchForm col-sm-12">
                <div className="searchSettings card">
                    <div className="card-block">
                        <h2 className="card-title">Onebox Search</h2>
                    </div>
                    <form onSubmit={this.submitSearch}>
                        <SearchBox contents={this.state.currentSearch} />
                    </form>
                </div>
                <div className="searchResults">
                    {mainScreen}
                </div>
            </div>
        );
    }
});


var TemplateTypeSelector = React.createClass({
    // Type selection component for the TemplateSearch.
    propTypes: {
        // A function that deals with changing the resource type when it is called with a string,
        // either "chants", "sources", "indexers", or "feasts".
        chooseNewType: React.PropTypes.func.isRequired,
        activeType: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {activeType: null};
    },
    chooseNewType: function(event) {
        let newType = 'chants';

        switch (event.target.id) {
            case 'indexersTypeButton':
                newType = 'indexers';
                break;

            case 'sourcesTypeButton':
                newType = 'sources';
                break;

            case 'feastsTypeButton':
                newType = 'feasts';
                break;
        }

        this.props.chooseNewType(newType);
    },
    render: function() {
        let className = 'btn btn-secondary-outline';
        let classNameActive = 'btn btn-secondary-outline active';

        let buttonProps = {
            'chants': {'className': className, 'aria-pressed': 'false'},
            'indexers': {'className': className, 'aria-pressed': 'false'},
            'sources': {'className': className, 'aria-pressed': 'false'},
            'feasts': {'className': className, 'aria-pressed': 'false'}
        };

        if (null !== this.props.activeType) {
            buttonProps[this.props.activeType]['aria-pressed'] = 'true';
            buttonProps[this.props.activeType]['className'] = classNameActive;
        }

        return (
            <div>
                <div className="btn-group" htmlRole="group" aria-label="resource type selector">
                    <button id="chantsTypeButton" type="button" className={buttonProps.chants.className}
                            aria-pressed={buttonProps.chants['aria-pressed']} onClick={this.chooseNewType}>
                            Chants</button>
                    <button id="feastsTypeButton" type="button" className={buttonProps.feasts.className}
                            aria-pressed={buttonProps.feasts['aria-pressed']} onClick={this.chooseNewType}>
                            Feasts</button>
                    <button id="indexersTypeButton" type="button" className={buttonProps.indexers.className}
                            aria-pressed={buttonProps.indexers['aria-pressed']} onClick={this.chooseNewType}>
                            Indexers</button>
                    <button id="sourcesTypeButton" type="button" className={buttonProps.sources.className}
                            aria-pressed={buttonProps.sources['aria-pressed']} onClick={this.chooseNewType}>
                            Sources</button>
                </div>
            </div>
        );
    }
});


var TemplateSearchField = React.createClass({
    // A single field in the TemplateSearch template.
    //

    propTypes: {
        // The field name according to the Cantus API.
        field: React.PropTypes.string.isRequired,
        // The field name displayed in the GUI. If omitted, the "field" is displayed.
        displayName: React.PropTypes.string,
        // You know... the field contents.
        contents: React.PropTypes.string,
        // And a function to call when the contents change!
        updateFieldContents: React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return {displayName: null, contents: ''};
    },
    render: function() {
        let displayName = this.props.displayName || this.props.field;
        let fieldID = `template-field-${this.props.field}`;

        return (
            <fieldset className="form-group row">
                <label className="col-sm-2">{displayName}</label>
                <div className="col-sm-10">
                    <input id={fieldID}
                           type="text"
                           className="form-control"
                           value={this.props.contents}
                           onChange={this.props.updateFieldContents}
                           />
                </div>
            </fieldset>
        );
    }
});


var TemplateSearchFields = React.createClass({
    // All the fields in a TemplateSearch template.
    //
    // Contained by TemplateSearchTemplate.
    // Contains a bunch of TemplateSearchField.
    //

    propTypes: {
        // A function that accepts two arguments: field name (according to the Cantus API) and its
        // new contents.
        updateField: React.PropTypes.func.isRequired,
        // A list of objects, each with three members: 'field', 'displayName', and 'contents'.
        // These are the internal and GUI names for the fields required in this template, plus the
        // current contents of the field.
        fieldNames: React.PropTypes.arrayOf(React.PropTypes.shape({
            field: React.PropTypes.string,
            displayName: React.PropTypes.string,
            contents: React.PropTypes.string
        })).isRequired
    },
    updateFieldContents: function(event) {
        // Accepts change event for one of the "TemplateSearchField" components, then calls the
        // updateField() function with appropriate arguments to pass changes "up."

        // Find the proper name of the modified field. Target is a TemplateSearchField, and its
        // @id starts with "template-field-".
        let fieldName = event.target.id.slice('template-field-'.length);

        // Now let our bosses know that a field changed!
        this.props.updateField(fieldName, event.target.value);
    },
    render: function() {
        let renderedFields = [];
        let fieldNames = this.props.fieldNames;
        fieldNames.forEach(function(field, index) {
            let fieldKey = `template-field-${index}`;

            renderedFields.push(<TemplateSearchField key={fieldKey}
                                                     field={field.field}
                                                     displayName={field.displayName}
                                                     contents={field.contents}
                                                     updateFieldContents={this.updateFieldContents}
                                                     />);
        }, this);

        return (
            <div className="card">
                <div className="card-block">
                    <form>{renderedFields}</form>
                </div>
            </div>
        );
    }
});


var TemplateSearchTemplate = React.createClass({
    // For TemplateSearch, this is the template. This just selects the proper sub-component, but it
    // leaves TemplateSearch much cleaner.
    //

    propTypes: {
        // A function that accepts two arguments: field name (according to the Cantus API) and its
        // new contents.
        updateField: React.PropTypes.func.isRequired,
        // The resource type for the template.
        type: React.PropTypes.oneOf(['chants', 'feasts', 'indexers', 'sources'])
    },
    updateField: function(name, value) {
        // Given the name of a field that was modified, and its new value, update our internal state
        // then tell our boss it was updated.
        let contents = this.state.contents;
        contents[name] = value;
        this.setState({contents: contents});
        this.props.updateField(name, value);
    },
    getInitialState: function() {
        // - contents: An object to store template field contents. This starts off empty, and has
        //             members added as this.updateField() is called. When this.props.type is
        //             changed, "contents" is replaced with an empty object.
        return {contents: {}};
    },
    getFieldContents: function(name) {
        // Return the currently-held contens of the "name" field or an empty string if the field has
        // not been set.
        if (undefined !== this.state.contents[name]) {
            return this.state.contents[name];
        } else {
            return '';
        }
    },
    componentWillReceiveProps: function(nextProps) {
        // If the nextProps.type is different from this.props.type, we should empty this.contents.
        if (nextProps.type !== this.props.type) {
            this.setState({contents: {}});
        }
    },
    render: function() {
        let fieldNames = [];

        switch (this.props.type) {
            case 'chants':
                fieldNames = [
                    {'field': 'incipit', 'displayName': 'Incipit'},
                    {'field': 'full_text', 'displayName': 'Full Text (standard spelling)'},
                    {'field': 'full_text_manuscript', 'displayName': 'Full Text (manuscript spelling)'},
                    {'field': 'id', 'displayName': 'ID'},
                    {'field': 'source', 'displayName': 'Source Name'},
                    {'field': 'marginalia', 'displayName': 'Marginalia'},
                    {'field': 'feast', 'displayName': 'Feast'},
                    {'field': 'office', 'displayName': 'Office'},
                    {'field': 'genre', 'displayName': 'Genre'},
                    {'field': 'folio', 'displayName': 'Folio'},
                    {'field': 'sequence', 'displayName': 'Sequence'},
                    {'field': 'position', 'displayName': 'Position'},
                    {'field': 'cantus_id', 'displayName': 'Cantus ID'},
                    {'field': 'mode', 'displayName': 'Mode'},
                    {'field': 'differentia', 'displayName': 'Differentia'},
                    {'field': 'finalis', 'displayName': 'Finalis'},
                    {'field': 'volpiano', 'displayName': 'Volpiano'},
                    {'field': 'notes', 'displayName': 'Notes'},
                    {'field': 'cao_concordances', 'displayName': 'CAO Concordances'},
                    {'field': 'siglum', 'displayName': 'Siglum'},
                    {'field': 'proofreader', 'displayName': 'Proofreader'},
                    {'field': 'melody_id', 'displayName': 'Melody ID'}
                ];
                break;

            case 'feasts':
                fieldNames = [
                    {'field': 'name', 'displayName': 'Name'},
                    {'field': 'description', 'displayName': 'Description'},
                    {'field': 'date', 'displayName': 'Date'},
                    {'field': 'feast_code', 'displayName': 'Feast Code'}
                ];
                break;

            case 'indexers':
                fieldNames = [
                    {'field': 'display_name', 'displayName': 'Full Name'},
                    {'field': 'given_name', 'displayName': 'Given Name'},
                    {'field': 'family_name', 'displayName': 'Family Name'},
                    {'field': 'institution', 'displayName': 'Institution'},
                    {'field': 'city', 'displayName': 'City'},
                    {'field': 'country', 'displayName': 'Country'},
                ];
                break;

            case 'sources':
                fieldNames = [
                    {'field': 'title', 'displayName': 'Title'},
                    {'field': 'summary', 'displayName': 'Summary'},
                    {'field': 'description', 'displayName': 'Description'},
                    {'field': 'rism', 'displayName': 'RISM'},
                    {'field': 'siglum', 'displayName': 'Siglum'},
                    {'field': 'provenance', 'displayName': 'Provenance'},
                    {'field': 'date', 'displayName': 'Date'},
                    {'field': 'century', 'displayName': 'Century'},
                    {'field': 'notation_style', 'displayName': 'Notation Style'},
                    {'field': 'editors', 'displayName': 'Editors'},
                    {'field': 'indexers', 'displayName': 'Indexers'},
                    {'field': 'proofreaders', 'displayName': 'Proofreaders'},
                    {'field': 'segment', 'displayName': 'Database Segment'},
                    {'field': 'source_status_desc', 'displayName': 'Source Status'},
                    {'field': 'liturgical_occasions', 'displayName': 'Liturgical Occasions'},
                    {'field': 'indexing_notes', 'displayName': 'Indexing Notes'},
                    {'field': 'indexing_date', 'displayName': 'Indexing Date'},
                ];
                break;
        }

        // Map the "contents" into every field
        fieldNames.map(function (field) {
            field['contents'] = this.getFieldContents(field.field);
            return field;
        }, this);

        return <TemplateSearchFields updateField={this.updateField}
                                     fieldNames={fieldNames}
                                     /> ;
    }
});


var TemplateSearch = React.createClass({
    propTypes: {
        cantusjs: React.PropTypes.object.isRequired,
    },
    getInitialState: function() {
        // - searchFor (object): members are fields with strings as values
        // - page
        // - perPage
        // - resourceType: the currently-active template ('chants', 'sources', 'indexers', 'feasts')
        // - currentSearch: terms of the current search (i.e., what's in the boxes right now)
        return {page: 1, perPage: 10, searchFor: {}, resourceType: 'chants', currentSearch: ''};
    },
    changePage: function(direction) {
        // Give this function a string, either "first," "previous," "next," or "last," to
        // determine which way to change the page. Or supply a page number directly.
        let newPage = 1;
        let curPage = this.state.page;

        if ("next" === direction) {
            newPage = curPage + 1;
        } else if ("previous" === direction) {
            if (curPage > 1) {
                newPage = curPage - 1;
            }
        } else if ("first" === direction) {
            // it's already 1
        } else if ("last" === direction) {
            newPage = "last";
        } else {
            newPage = direction;
        }

        this.setState({page: newPage, errorMessage: null});
    },
    changePerPage: function(newPerPage) { this.setState({perPage: newPerPage, page: 1, errorMessage: null}); },
    changeResourceType: function(resourceType) {
        // A function that deals with changing the resource type when it is called with a string,
        // either "chants", "sources", "indexers", or "feasts".
        // TODO: rewrite this
        // TODO: when you rewrite this, make sure you clear the "searchFor" object when you change type
        this.setState({resourceType: resourceType, currentSearch: "", page: 1, errorMessage: null,
                       searchFor: {}});
    },
    submitSearch: function() {
        let searchFor = this.state.searchFor;
        let query = '';

        for (let field in searchFor) {
            query += ` ${field}:${encloseWithQuotes(searchFor[field])}`;
        }

        // remove leading space
        query = query.slice(1);

        this.setState({currentSearch: query, page: 1, errorMessage: null});
    },
    updateField: function(fieldName, newContents) {
        // Update the searched-for value of "fieldName" to "newContents".
        let searchFor = this.state.searchFor;
        searchFor[fieldName] = newContents;
        this.setState({'searchFor': searchFor});
    },
    render: function() {
        // TODO: find a better way to manage the state, because this is stupid.

        // fields that shouldn't be rendered for users
        // NB: this must be done before the call to the <ResultListFrame> component
        let dontRender = ['id', 'type'];

        // TODO: refactor "ResultListFrame" so it doesn't show anything if the "searchQuery" is null or sthg
        return (
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-block">
                        <h2 className="card-title">Template Search</h2>
                        <TemplateTypeSelector chooseNewType={this.changeResourceType}
                                              activeType={this.state.resourceType}
                                              />
                    </div>
                    <TemplateSearchTemplate type={this.state.resourceType} updateField={this.updateField}/>
                    <div className="card-block">
                        <button className="btn btn-primary-outline" onClick={this.submitSearch}>Search</button>
                    </div>
                </div>
                <div>
                    <ResultListFrame resourceType={this.state.resourceType}
                                     dontRender={dontRender}
                                     perPage={this.state.perPage}
                                     page={this.state.page}
                                     searchQuery={this.state.currentSearch}
                                     changePage={this.changePage}
                                     cantus={this.props.cantusjs}
                                     doGenericGet={false}
                    />
                </div>
            </div>
        );
    }
});


let NavbarItem = React.createClass({
    propTypes: {
        // the textual name to display for this navbar entry
        name: React.PropTypes.string.isRequired,
        // a function to execute when the navbar button is clicked
        onClick: React.PropTypes.func,
        // whether this is the currently-active navbar item
        active: React.PropTypes.bool
    },
    getDefaultProps: function() {
        return {onClick: null, active: false};
    },
    defaultOnClick: function() {
        alert('That functionality is not implemented yet.');
    },
    render: function() {
        let navbarButton;

        if (this.props.active) {
            navbarButton = (
                <a className="btn btn-primary-outline active">
                    {this.props.name}
                    <span className="sr-only">(current)</span>
                </a>
            );
        } else if (null === this.props.onClick) {
            navbarButton = <a className="btn btn-primary-outline disabled">{this.props.name}</a>;
        } else {
            navbarButton = (
                <a className="btn btn-primary-outline" onClick={this.props.onClick}>
                    {this.props.name}
                </a>
            );
        }

        return (
            <li className="nav-item">{navbarButton}</li>
        );
    }
});


let VitrailNavbar = React.createClass({
    propTypes: {
        // array of objects with the props required for the "NavbarItem" component
        navbarItems: React.PropTypes.arrayOf(React.PropTypes.object)
    },
    getDefaultProps: function() {
        return [];
    },
    render: function() {
        let navbarButtons = [];

        this.props.navbarItems.forEach(function(btn, key) {
            navbarButtons.push(
                <NavbarItem key={key} name={btn.name} onClick={btn.onClick} active={btn.active}/>
            );
        });

        return (
            <nav className="navbar navbar-light bg-faded">
                <div className="navbar-brand">CANTUS Database</div>
                <ul className="nav navbar-nav">
                    {navbarButtons}
                </ul>
            </nav>
        );
    }
});


let Vitrail = React.createClass({
    propTypes: {
        // URL to the root of the Cantus API server
        rootUrl: React.PropTypes.string.isRequired,
    },
    // State Definition
    // ================
    // - activeScreen: Internal name of the currently-active screen; one of:
    //    - 'onebox'  (Onebox Search)
    //    - 'basic'  (Basic Search)
    //    - 'template'  (Template Search)
    //    - 'workspace'  (My Workspace)
    getInitialState: function() {
        return ({
            activeScreen: 'template',
            cantusjs: new cantusModule.Cantus(this.props.rootUrl)
        });
    },
    activateOnebox: function() { this.setState({activeScreen: 'onebox'}); },
    activateBasic: function() { this.setState({activeScreen: 'basic'}); },
    activateTemplate: function() { this.setState({activeScreen: 'template'}); },
    activateWorkspace: function() { this.setState({activeScreen: 'workspace'}); },
    render: function() {
        let navbarItems = [
            // {name, onClick, active}
            {name: 'Onebox Search', active: false, onClick: this.activateOnebox},
            {name: 'Basic Search (just for testing)', active: false, onClick: this.activateBasic},
            {name: 'Template Search', active: false, onClick: this.activateTemplate},
            {name: 'My Workspace', active: false, onClick: this.activateWorkspace}
        ];

        let activeScreen = <div className="alert alert-danger" htmlRole="alert">Not implemented!</div>;

        // deal with activating the active screen
        if ('onebox' === this.state.activeScreen) {
            navbarItems[0]['active'] = true;
            navbarItems[0]['onClick'] = null;
            activeScreen = <OneboxSearch cantusjs={this.state.cantusjs}/>
        } else if ('basic' === this.state.activeScreen) {
            navbarItems[1]['active'] = true;
            navbarItems[1]['onClick'] = null;
            activeScreen = <BasicSearch cantusjs={this.state.cantusjs}/>
        } else if ('template' === this.state.activeScreen) {
            navbarItems[2]['active'] = true;
            navbarItems[2]['onClick'] = null;
            activeScreen = <TemplateSearch cantusjs={this.state.cantusjs}/>
        } else if ('workspace' === this.state.activeScreen) {
            navbarItems[3]['active'] = true;
            navbarItems[3]['onClick'] = null;
        }

        return (
            <div>
                <VitrailNavbar navbarItems={navbarItems}/>
                <div className="container-fluid">{activeScreen}</div>
            </div>
        );
    }
});


export {SearchBox, TypeRadioButton, TypeSelector, PerPageSelector, ResultColumn, Result, ResultList,
        Paginator, ResultListFrame, BasicSearch, Vitrail, OneboxSearch};
