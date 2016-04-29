var _ = require('underscore');
var d3 = require('d3');
var _ = require('underscore');

var BiolinksModel = function() {
    var model = this;
    model.color = d3.scale.category20();

    model.model =  {
        'ACTI': {types: ['T052', 'T053', 'T056', 'T051', 'T064', 'T055', 'T066', 'T057', 'T054']},
        'ANAT': {types: ['T017', 'T029', 'T023', 'T030', 'T031', 'T022', 'T025', 'T026', 'T018', 'T021', 'T024']},
        'CHEM': {types: ['T123', 'T122', 'T118', 'T103', 'T120', 'T104', 'T111', 'T196', 'T131', 'T125', 'T129', 'T130',
                'T197', 'T119', 'T124', 'T109', 'T115', 'T110', 'T127']},
        'CONC': {types: ['T185', 'T077', 'T169', 'T102', 'T078', 'T170', 'T171', 'T080', 'T081', 'T089',
            'T082', 'T079']},
        'DEVI': {types: ['T203', 'T074', 'T075']},
        'DISO': {types: ['T020', 'T190', 'T049', 'T019', 'T047', 'T050', 'T037', 'T048', 'T191', 'T046']},
        'DRUG': {types: ['T195', 'T200', 'T121']},
        'GENE': {types: ['T087', 'T088', 'T028', 'T085', 'T086']},
        'GEOG': {types: ['T083']},
        'GNPT': {types: ['T116', 'T126', 'T114', 'T192']},
        'OBJC': {types: ['T071', 'T168', 'T073', 'T072', 'T167']},
        'OBSV': {types: ['T201', 'T041', 'T032']},
        'OCCU': {types: ['T091', 'T090']},
        'ORGA': {types: ['T093', 'T092', 'T094', 'T095']},
        'PEOP': {types: ['T100', 'T099', 'T096', 'T101', 'T098', 'T097']},
        'PHEN': {types: ['T038', 'T069', 'T068', 'T034', 'T070', 'T067']},
        'PHYS': {types: ['T043', 'T045', 'T044', 'T040', 'T042', 'T039']},
        'PROC': {types: ['T060', 'T065', 'T058', 'T059', 'T063', 'T062', 'T061']},
        'SYMP': {types: ['T033', 'T184']},
        'TAXA': {types: ['T011', 'T008', 'T194', 'T007', 'T012', 'T204', 'T013', 'T004', 'T016', 'T015', 'T001', 'T002',
            'T014', 'T010', 'T005']}
    };

    _.each(_.keys(model.model), function(key, index) {
        model.model[key].color = model.color(index);
    });

    model.getGroups = function() {
        return _.keys(model.model).sort();
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