// -*- coding: utf-8 -*-
//-------------------------------------------------------------------------------------------------
// Program Name:           vitrail
// Program Description:    HTML/CSS/JavaScript user agent for the Cantus API.
//
// Filename:               vitrail_tests/test_signals.js
// Purpose:                NuclearJS signals for Vitrail.
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
//-------------------------------------------------------------------------------------------------

import init from '../js/nuclear/init';

// mocked
import {log} from '../js/util/log';

// unmocked
import nuclear from 'nuclear-js';
const Immutable = nuclear.Immutable;

import cantusjs from '../js/cantusjs/cantus.src';

import getters from '../js/nuclear/getters';
import reactor from '../js/nuclear/reactor';
import {SIGNAL_NAMES as signal_names} from '../js/nuclear/signals';
import {SIGNALS as signals} from '../js/nuclear/signals';


describe('setSearchResultsFormat()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works', () => {
        const to = 'table';
        // make sure it's starting with the other value
        expect(reactor.evaluate(getters.searchResultsFormat)).toBe('ItemView');
        signals.setSearchResultsFormat(to);
        expect(reactor.evaluate(getters.searchResultsFormat)).toBe(to);
    });
});


describe('setPage()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works', () => {
        // trick it into thinking there are 10 available pages
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        const to = 3;
        // make sure it's starting with another value
        expect(reactor.evaluate(getters.searchPage)).not.toBe(to);
        signals.setPage(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(to);
    });
});


describe('setPerPage()', () => {
    beforeEach(() => { reactor.reset(); });

    it('updates when the value is different', () => {
        const to = 42;
        // trick it into thinking there are 10 available pages --- make sure it resets "page" to 1
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        signals.setPage(5);

        signals.setPerPage(to);

        expect(reactor.evaluate(getters.searchPerPage)).toBe(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(1);
    });

    it('does not update when the value is the same', () => {
        const to = 10;
        // trick it into thinking there are 10 available pages --- make sure it resets "page" to 1
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        signals.setPage(5);
        // double-check that it is 10 even before we call setPerPage()
        expect(reactor.evaluate(getters.searchPerPage)).toBe(to);

        signals.setPerPage(to);

        expect(reactor.evaluate(getters.searchPerPage)).toBe(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(5);
    });

    it('does not update when the value is invalid', () => {
        const to = 1000;
        // trick it into thinking there are 10 available pages --- make sure it resets "page" to 1
        signals.loadSearchResults(Immutable.fromJS({headers: {total_results: 100, per_page: 10}}));
        const currentPage = 5;
        signals.setPage(currentPage);

        signals.setPerPage(to);

        expect(reactor.evaluate(getters.searchPerPage)).not.toBe(to);
        expect(reactor.evaluate(getters.searchPage)).toBe(currentPage);
    });
});


describe('setResourceType()', () => {
    beforeEach(() => { reactor.reset(); });

    it('works', () => {
        const to = 'feast';
        const expected = 'feasts';  // converted to plural with CantusJS
        expect(reactor.evaluate(getters.resourceType)).not.toBe(to);

        signals.setResourceType(to);

        expect(reactor.evaluate(getters.resourceType)).toBe(expected);
    });
});


describe('setSearchQuery()', () => {
    beforeEach(() => { reactor.reset(); });

    it('updates when called with an object', () => {
        const params = {incipit: 'letter', genre: 'number'};
        signals.setSearchQuery(params);
        const actual = reactor.evaluate(getters.searchQuery);
        expect(actual.get('incipit')).toBe('letter');
        expect(actual.get('genre')).toBe('number');
    });

    it('updates when called with "clear"', () => {
        // first put some stuff in
        signals.setSearchQuery({incipit: 'letter'});
        expect(reactor.evaluate(getters.searchQuery).get('incipit')).toBe('letter');
        // now clear everything
        signals.setSearchQuery('clear');
        expect(reactor.evaluate(getters.searchQuery).get('incipit')).toBe(undefined);
    });

    it('logs a warning when called with anything else', () => {
        signals.setSearchQuery(5);
        expect(log.warn).toBeCalled();
    });
});


describe('submitSearchQuery()', () => {
    beforeEach(() => {
        reactor.reset();
        cantusjs.Cantus.prototype.search.mockClear();
        cantusjs.Cantus.prototype.get.mockClear();
    });

    describe('loadSearchResults()', () => {
        it('calls the Reactor', () => {
            const results = {res: 'ults'};
            signals.loadSearchResults(results);
            expect(reactor.evaluate(getters.searchResults).get('res')).toBe('ults');
        });
    });

    it('calls CANTUS.search() properly', () => {
        // make a mock Promise to return from search(), then set it to be returned
        const mockSearch = cantusjs.Cantus.prototype.search;
        const mockPromise = {then: jest.genMockFn()};
        const mockThen = {catch: jest.genMockFn()};
        mockPromise.then.mockReturnValue(mockThen);
        mockSearch.mockReturnValueOnce(mockPromise);
        // setup some query
        const params = {incipit: 'letter', type: 'feasts'};
        signals.setSearchQuery(params);
        // expected argument to search()
        const expAjaxSettings = {type: 'feasts', incipit: 'letter', page: 1, per_page: 10};

        signals.submitSearchQuery();

        expect(mockSearch).toBeCalledWith(expAjaxSettings);
        // NOTE: for some reason, these don't work with the usual expect().toBeCalledWith() checks,
        //       so we'll have to go with this, which is clumsy but at least works
        expect(mockPromise.then.mock.calls.length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0].length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
        expect(mockThen.catch.mock.calls.length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0].length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
    });

    it('calls CANTUS.get() properly', () => {
        // make a mock Promise to return from get(), then set it to be returned
        const mockGet = cantusjs.Cantus.prototype.get;
        const mockPromise = {then: jest.genMockFn()};
        const mockThen = {catch: jest.genMockFn()};
        mockPromise.then.mockReturnValue(mockThen);
        mockGet.mockReturnValueOnce(mockPromise);
        // setup return values from reactor.evaluate()
        const params = {type: 'feasts'};
        signals.setSearchQuery(params);
        // expected argument to get()
        const expAjaxSettings = {type: 'feasts', page: 1, per_page: 10};

        signals.submitSearchQuery();

        expect(mockGet).toBeCalledWith(expAjaxSettings);
        // NOTE: for some reason, these don't work with the usual expect().toBeCalledWith() checks,
        //       so we'll have to go with this, which is clumsy but at least works
        expect(mockPromise.then.mock.calls.length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0].length === 1).toBe(true);
        expect(mockPromise.then.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
        expect(mockThen.catch.mock.calls.length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0].length === 1).toBe(true);
        expect(mockThen.catch.mock.calls[0][0] === signals.loadSearchResults).toBe(true);
    });
});
