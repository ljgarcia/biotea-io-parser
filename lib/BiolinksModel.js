var _ = require('underscore');
var d3 = require('d3');
var _ = require('underscore');

var BiolinksModel = function() {
    var model = this;
    model.pmra = {
        miu: 0.013,
        lambda: 0.022
    };
    model.color = d3.scale.category20();
    model.groups = [];

    model.model =  {
        'ACTI': {
            desc: 'Activities & Behaviors', lambda: 0.171066997,
            types: ['T052', 'T053', 'T056', 'T051', 'T064', 'T055', 'T066', 'T057', 'T054']},
        'ANAT': {
            desc: 'Anatomy', lambda: 0.590092187,
            types: ['T017', 'T029', 'T023', 'T030', 'T031', 'T022', 'T025', 'T026', 'T018', 'T021', 'T024']},
        'CHEM': {
            desc: 'Chemical entities', lambda: 0.338788742,
            types: ['T123', 'T122', 'T118', 'T103', 'T120', 'T104', 'T111', 'T196', 'T131', 'T125', 'T129', 'T130',
                'T197', 'T119', 'T124', 'T109', 'T115', 'T110', 'T127']},
        'CONC': {
            desc: 'Concepts & Ideas', lambda: 1.186964865,
            types: ['T185', 'T077', 'T169', 'T102', 'T078', 'T170', 'T171', 'T080', 'T081', 'T089',
            'T082', 'T079']},
        'DEVI': {
            desc: 'Devices', lambda: 0.08770559,
            types: ['T203', 'T074', 'T075']},
        'DISO': {
            desc: 'Disorders', lambda: 0.763191846,
            types: ['T020', 'T190', 'T049', 'T019', 'T047', 'T050', 'T037', 'T048', 'T191', 'T046']},
        'DRUG': {
            desc: 'Drugs', lambda: 0.11454699,
            types: ['T195', 'T200', 'T121']},
        'GENE': {
            desc: 'Genes & Molecular Sequences', lambda: 0.750131316,
            types: ['T087', 'T088', 'T028', 'T085', 'T086']},
        'GEOG': {
            desc: 'Geographic Areas', lambda: 0.030377458,
            types: ['T083']},
        'GNPT': {
            desc: 'DNA & Protein molecules', lambda: 1.357868307,
            types: ['T116', 'T126', 'T114', 'T192']},
        'OBJC': {
            desc: 'Objects', lambda: 0.100822984,
            types: ['T071', 'T168', 'T073', 'T072', 'T167']},
        'OBSV': {
            desc: 'Physiology attributes & processes', lambda: 0.188466395,
            types: ['T201', 'T041', 'T032']},
        'OCCU': {
            desc: 'Occupations', lambda: 0.055810256,
            types: ['T091', 'T090']},
        'ORGA': {
            desc: 'Organizations', lambda: 0.014112602,
            types: ['T093', 'T092', 'T094', 'T095']},
        'PEOP': {
            desc: 'People/Population groups', lambda: 0.14447583,
            types: ['T100', 'T099', 'T096', 'T101', 'T098', 'T097']},
        'PHEN': {
            desc: 'Phenomena', lambda: 0.15883406,
            types: ['T038', 'T069', 'T068', 'T034', 'T070', 'T067']},
        'PHYS': {
            desc: 'Physiological functions', lambda: 0.663635755,
            types: ['T043', 'T045', 'T044', 'T040', 'T042', 'T039']},
        'PROC': {
            desc: 'Procedures', lambda: 0.542553087,
            types: ['T060', 'T065', 'T058', 'T059', 'T063', 'T062', 'T061']},
        'SYMP': {
            desc: 'Disorder symptoms', lambda: 0.352374159,
            types: ['T033', 'T184']},
        'TAXA': {
            desc: 'Taxonomic terms', lambda: 0.3171206,
            types: ['T011', 'T008', 'T194', 'T007', 'T012', 'T204', 'T013', 'T004', 'T016', 'T015', 'T001', 'T002',
            'T014', 'T010', 'T005']}
    };

    _.each(_.keys(model.model), function(key, index) {
        model.model[key].color = model.color(index);
    });

    model.getGroups = function() {
        if (model.groups.length === 0) {
            model.groups = _.keys(model.model).sort();
        }
        return model.groups;
    };

    model.isTypeInGroup = function(group, type) {
        var model = this;
        var foundGroup = _.find(model.model, function(elem, key) {
            return (group === key) && (_.contains(elem.types, type));
        });
        if (foundGroup) {
            return true;
        } else {
            return false;
        }
    };

    model.findGroup = function(type) {
        var group;
        var result = _.find(model.model, function(elem, key) {
            group = key;
            return _.contains(elem.types, type);
        });
        return result ? group : undefined;
    };

    model.getGroupColor = function(group) {
        var model = this;
        return model.model[group] ? model.model[group].color : 'black';
    };
};

module.exports = BiolinksModel;