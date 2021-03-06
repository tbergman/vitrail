// -*- coding: utf-8 -*-
// ------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               js/react/vitrail.js
// Purpose:                Core React components for Vitrail.
//
// Copyright (C) 2015, 2016 Christopher Antila
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
// ------------------------------------------------------------------------------------------------

import React from 'react';
import {Immutable} from 'nuclear-js';
import {Link} from 'react-router';

import Alert from 'react-bootstrap/lib/Alert';
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';


// This is the list of software given to the Colophon.
const listOfSoftware = [
    {
        name: 'Abbot',
        version: '0.7.10+',
        description: 'The Cantus Server that provides data to the Web App.',
        licence: 'AGPLv3+',
        link: 'https://github.com/CANTUS-Project/abbot',
    },
    {
        name: 'CantusJS',
        version: 'commit 84accc6',
        description: 'The Web App\'s adapter for Abbot.',
        licence: 'GPLv3+',
        link: 'https://github.com/CANTUS-Project/cantus-js',
    },
    {
        name: 'pysolr-tornado',
        version: '4.0.0a1',
        description: 'Used by Abbot to connect to a "Solr" database.',
        licence: 'New BSD',
        link: 'https://github.com/CANTUS-Project/pysolr-tornado',
    },
    {
        name: 'Vitrail',
        version: '0.4.2+',
        description: 'The Cantus Web App itself.',
        licence: 'AGPLv3+',
        link: 'https://github.com/CANTUS-Project/vitrail',
    },
];


/** AlertFieldList: AlertView subcomponent, a table of fields to values
 *
 * Props
 * -----
 * @param (ImmutableJS.Map) fields - A Map of key/value pairs with additional information for the
 *     user. These should help the user either solve the problem, or report it to the developers.
 */
const AlertFieldList = React.createClass({
    propTypes: {
        fields: React.PropTypes.instanceOf(Immutable.Map),
    },
    getDefaultProps() {
        return {fields: Immutable.Map()};
    },
    render() {
        if (this.props.fields.size < 1) {
            return null;
        }

        const innerList = [];
        this.props.fields.forEach((value, key) => {
            innerList.push(
                <tr key={key.toLocaleLowerCase()}>
                    <td className="td-align-right">{`${key}:`}</td>
                    <td>{value}</td>
                </tr>
            );
        });

        return (
            <Table fill striped>
                <tbody>
                    {innerList}
                </tbody>
            </Table>
        );
    },
});


/** Alert the user about something.
 *
 * This component is intended primarily for alerting users about errors, but may also be used for
 * other purposes, like to alert them that an edit was successfully saved in the database.
 *
 * This component may be embedded in the user interface, or of "overlay" is set to true, displayed
 * "in front of" all
 *
 * Props
 * -----
 * @param (str) children - The error message to display to the user. Required.
 * @param (str) class - A Bootstrap 4 "contextual class" for the message (success, info, warning,
 *     danger). Defaults to "info."
 * @param (ImmutableJS.Map) fields - A Map of key/value pairs with additional information for the
 *     user. These should help the user either solve the problem, or report it to the developers.
 *
 */
const AlertView = React.createClass({
    propTypes: {
        // children
        class: React.PropTypes.oneOf(['success', 'info', 'warning', 'danger']),
        fields: React.PropTypes.instanceOf(Immutable.Map),
    },
    getDefaultProps() {
        return {class: 'info'};
    },
    render() {
        return (
            <Panel>
                <Alert bsStyle={this.props.class}>
                    {this.props.children}
                </Alert>
                <AlertFieldList fields={this.props.fields}/>
            </Panel>
        );
    },
});


/** A table of the software developed for CANTUS.
 *
 * Props:
 * ------
 * @param (array of object) software - An array of objects with the following members: "name",
 *     "version", "description", "licence", and "link". All data should be strings.
 */
const SoftwareTable = React.createClass({
    propTypes: {
        software: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    },
    getDefaultProps() {
        return {software: []};
    },
    render() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>{`Software`}</th>
                        <th>{`Version`}</th>
                        <th>{`Description`}</th>
                        <th>{`Licence`}</th>
                        <th>{`Source Code`}</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.software.map((software) =>
                        <tr key={software.name.toLocaleLowerCase()}>
                            <td>{software.name}</td>
                            <td>{software.version}</td>
                            <td>{software.description}</td>
                            <td>{software.licence}</td>
                            <td><a href={software.link}>{`Link`}</a></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    },
});


/** An "About Cantus" component for the Vitrail home page.
 *
 */
const Colophon = React.createClass({
    render() {
        return (
            <article className="container">
                <section>
                    <h1>{`About the Cantus Web App`}</h1>
                    <p className="lead">
                        {`The `}<em>{`Cantus Web App`}</em>{` is an offline-capable interface for
                        browsing the Cantus Database.`}
                    </p>
                    <p>
                        {`The Web App is a website that works everywhere. If your browser is new
                        enough, the Web App offers additional functionality that usually requires
                        installing an app. For example, you can make collections of chants,
                        which are automatically stored for offline access. Because the chants are
                        stored in your browser, there's no need to make an account on a server!`}
                    </p>
                    <p>
                        {`The Cantus Web App is a new complement to the `}
                        <a href="http://cantus.uwaterloo.ca/">{`Cantus Database`}</a>{`. Both
                        websites will continue to exist for the forseeable future\u2014the Web App
                        is not a replacement for the Database. Each website has different strengths,
                        and we encourage you to explore and use both as you see fit.`}
                    </p>
                </section>
                <section>
                    <h2>{`About Cantus`}</h2>
                    <p className="lead">
                        {`Cantus is a database of the Latin chants found in over 130 manuscripts and
                        early printed books.`}
                    </p>
                    <p>
                        {`The data you find in the Cantus Web App are created and curated by the
                        Cantus Project. This searchable digital archive holds inventories of primarily
                        antiphoners and breviaries from medieval Europe; these are the main sources for
                        the music sung in the liturgical Office. The primary user interface, called `}
                        <em>{`Cantus Database`}</em>{`, is available at `}
                        <a href="http://cantus.uwaterloo.ca/">{`http://cantus.uwaterloo.ca/`}</a>{`.`}
                    </p>
                </section>

                <section>
                    <h2>{`One last thing...`}</h2>
                    <p>
                        {`The Cantus Web App is \u201Cfree and open source\u201D software, which means
                        you have different legal rights than with most software. For example,
                        you can access the application\u0027s \u201Csource code\u201D to modify,
                        share, or study it. The following list briefly describes some
                        of the software used in the Web App, and where to access its source code.`}
                    </p>
                    <SoftwareTable software={listOfSoftware}/>
                </section>
            </article>
        );
    },
});


const NavbarItem = React.createClass({
    propTypes: {
        // the URL path (according to react-router) for this NavbarItem
        link: React.PropTypes.string.isRequired,
        // the textual name to display for this navbar entry
        name: React.PropTypes.string.isRequired,
    },
    render() {
        return (
            <li>
                <Link to={this.props.link} activeClassName="active">
                    {this.props.name}
                </Link>
            </li>
        );
    },
});


const VitrailNavbar = React.createClass({
    propTypes: {
        // array of objects with the props required for the "NavbarItem" component
        navbarItems: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                name: React.PropTypes.string,
                link: React.PropTypes.string,
            })
        ),
    },
    getDefaultProps() {
        return {navbarItems: []};
    },
    render() {
        return (
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="/">{`Cantus Web App`}</a>
                    </Navbar.Brand>
                    <Navbar.Toggle/>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        {this.props.navbarItems.map((item, index) =>
                            <NavbarItem key={index} name={item.name} link={item.link}/>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    },
});


const NotImplemented = React.createClass({
    render() {
        return (
            <Alert scStyle="danger">{`Not implemented!`}</Alert>
        );
    },
});


const Vitrail = React.createClass({
    //

    propTypes: {
        children: React.PropTypes.element,
    },
    render() {
        const navbarItems = [
            // {name, link}
            {name: 'Onebox Search', link: '/onebox'},
            {name: 'Template Search', link: '/template'},
            {name: 'Workspace', link: '/workspace'},
            {name: 'Use Cantus Offline', link: '/offline'},
            // {name: 'BookView (devel)',     link: '/bookview'},
        ];

        return (
            <div>
                <VitrailNavbar navbarItems={navbarItems}/>
                {this.props.children}
            </div>
        );
    },
});


const MODULE_FOR_TESTING = {
    AlertView, AlertFieldList, Colophon, NotImplemented, Vitrail
};
export {AlertView, Colophon, NotImplemented, Vitrail, MODULE_FOR_TESTING};
