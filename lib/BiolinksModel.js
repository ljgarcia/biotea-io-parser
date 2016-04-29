var _ = require('underscore');
var d3 = require('d3');

var BiolinksModel = function() {
    var model = this;
    model.color = d3.scale.category20();

    model.model =  {
        'ACTI': ['T052', 'T053', 'T056', 'T051', 'T064', 'T055', 'T066', 'T057', 'T054'],
        'ANAT': ['T017', 'T029', 'T023', 'T030', 'T031', 'T022', 'T025', 'T026', 'T018', 'T021', 'T024'],
        'CHEM': ['T123', 'T122', 'T118', 'T103', 'T120', 'T104', 'T111', 'T196', 'T131', 'T125', 'T129', 'T130',
            'T197', 'T119', 'T124', 'T109', 'T115', 'T110', 'T127'],
        'CONC': ['T185', 'T077', 'T169', 'T102', 'T078', 'T170', 'T171', 'T080', 'T081', 'T089', 'T082', 'T079'],
        'DEVI': ['T203', 'T074', 'T075'],
        'DISO': ['T020', 'T190', 'T049', 'T019', 'T047', 'T050', 'T037', 'T048', 'T191', 'T046'],
        'DRUG': ['T195', 'T200', 'T121'],
        'GENE': ['T087', 'T088', 'T028', 'T085', 'T086'],
        'GEOG': ['T083'],
        'GNPT': ['T116', 'T126', 'T114', 'T192'],
        'OBJC': ['T071', 'T168', 'T073', 'T072', 'T167'],
        'OBSV': ['T201', 'T041', 'T032'],
        'OCCU': ['T091', 'T090'],
        'ORGA': ['T093', 'T092', 'T094', 'T095'],
        'PEOP': ['T100', 'T099', 'T096', 'T101', 'T098', 'T097'],
        'PHEN': ['T038', 'T069', 'T068', 'T034', 'T070', 'T067'],
        'PHYS': ['T043', 'T045', 'T044', 'T040', 'T042', 'T039'],
        'PROC': ['T060', 'T065', 'T058', 'T059', 'T063', 'T062', 'T061'],
        'SYMP': ['T033', 'T184'],
        'TAXA': ['T011', 'T008', 'T194', 'T007', 'T012', 'T204', 'T013', 'T004', 'T016', 'T015', 'T001', 'T002',
            'T014', 'T010', 'T005']
    };

    model.getIndex = function(group) {
        var model = this;
        var myIndex = -1;
        var result = _.find(model.model, function(myTypes, key) {
            myIndex++;
            return group === key;
        });
        return result === undefined ? -1 : myIndex;
    };

    model.isTypeInGroup = function(group, type) {
        var model = this;
        var foundGroup = _.find(model.model, function(types, key) {
            return (group === key) && (_.contains(types, type));
        });
        if (foundGroup) {
            return true;
        } else {
            return false;
        }
    };

    model.findGroup = function(sty) {
        var group;
        var result = _.find(model.model, function(myTypes, key) {
            group = key;
            return _.contains(myTypes, sty);
        });
        return result ? group : undefined;
    };

    model.getGroupColor = function(group) {
        var model = this;
        var groupIndex = model.getIndex(group);
        return groupIndex === -1 ? 'black': color(groupIndex);
    };
};

module.exports = BiolinksModel;