// Project Constants
const UNDEFINED_INT = -1;

const MOUSEBUTTON_LEFT = "left";
const MOUSEBUTTON_MIDDLE = "middle";
const MOUSEBUTTON_RIGHT = "right";
const MOUSEBUTTON_UNKNOWN = "unknown";

const TURNCELLTYPE_BOMB = 1;
const TURNCELLTYPE_BLOCKCREATE = 2;
const TURNCELLTYPE_BLOCKDELETE = 3;

const TURNCELLOPTION_NONE = 0; // TURNCELLTYPE_BOMB
const TURNCELLOPTION_UNITKILL = 1; // TURNCELLTYPE_BLOCKCREATE
const TURNCELLOPTION_UNITREMOVE = 2; // TURNCELLTYPE_BLOCKCREATE
const TURNCELLOPTION_UNITLIVE = 3; // TURNCELLTYPE_BLOCKCREATE
const TURNCELLOPTION_BLOCKKILL = 4; // TURNCELLTYPE_BLOCKDELETE
const TURNCELLOPTION_BLOCKREMOVE = 5; // TURNCELLTYPE_BLOCKDELETE

const BLOCKOPTION1_UNITKILL = 1;
const BLOCKOPTION1_UNITREMOVE = 2;
const BLOCKOPTION1_UNITLIVE = 3;

const BLOCKOPTION2_BLOCKKILL = 1;
const BLOCKOPTION2_BLOCKREMOVE = 2;

const NOTATION_UNCLEAR = "(U)";

const RACE_NONE = "None";
const RACE_ZERG = "Zerg";
const RACE_TERRAN = "Terran";
const RACE_PROTOSS = "Protoss";

// Bomb Units
const UNIT_ZERG_SCOURGE = "Zerg Scourge";
const UNIT_ZERG_OVERLORD = "Zerg Overlord";
const UNIT_ZERG_DEVOURER = "Zerg Devourer";
const UNIT_ZERG_MUTALISK = "Zerg Mutalisk";
const UNIT_ZERG_ULTRALISK = "Zerg Ultralisk";

const UNIT_TERRAN_SCV = "Terran SCV";
const UNIT_TERRAN_DROPSHIP = "Terran Dropship";
const UNIT_TERRAN_WRAITH = "Terran Wraith";
const UNIT_TERRAN_BATTLECRUISER = "Terran Battlecruiser";

const UNIT_PROTOSS_OBSERVER = "Protoss Observer";
const UNIT_PROTOSS_PROBE = "Protoss Probe";
const UNIT_PROTOSS_CORSAIR = "Protoss Corsair";
const UNIT_PROTOSS_ARBITER = "Protoss Arbiter";
const UNIT_PROTOSS_SCOUT = "Protoss Scout";
const UNIT_PROTOSS_ARCHON = "Protoss Archon";
const UNIT_PROTOSS_DARKARCHON = "Protoss Dark Archon";

// Block Units
const UNIT_TERRAN_MACHINESHOP = "Terran Machine Shop";
const UNIT_TERRAN_MACHINESHOP_UNCLEAR = UNIT_TERRAN_MACHINESHOP + NOTATION_UNCLEAR;
const UNIT_NEUTRAL_PSIEMITTER = "Psi Emitter";
const UNIT_NEUTRAL_PSIEMITTER_UNCLEAR = UNIT_NEUTRAL_PSIEMITTER + NOTATION_UNCLEAR;
const UNIT_NEUTRAL_KHALISCRYSTAL = "Khalis Crystal";
const UNIT_NEUTRAL_KHALISCRYSTAL_UNCLEAR = UNIT_NEUTRAL_KHALISCRYSTAL + NOTATION_UNCLEAR;
const UNIT_NEUTRAL_URAJCRYSTAL = "Uraj Crystal";
const UNIT_NEUTRAL_URAJCRYSTAL_UNCLEAR = UNIT_NEUTRAL_URAJCRYSTAL + NOTATION_UNCLEAR;
const UNIT_NEUTRAL_KHAYDARINCRYSTAL = "Khaydarin Crystal";
const UNIT_NEUTRAL_KHAYDARINCRYSTAL_UNCLEAR = UNIT_NEUTRAL_KHAYDARINCRYSTAL + NOTATION_UNCLEAR;
const UNIT_OTHER_BLOCKEXPLOSION1 = "Block Explosion 1x1";
const UNIT_OTHER_BLOCKEXPLOSION2 = "Block Explosion 2x2";

/* Default Project Settings */
const SHORT_APP_NAME = "BoundEditorLS";
const DEFAULT_PROJECT_NAME = "새 프로젝트";
const DEFAULT_PATTERN_LABEL = "패턴 01";
const DEFAULT_PATTERN_DESCRIPTION = "";
const DEFAULT_TILESET = SCTilesetList.Badlands;
const DEFAULT_LOCATION_LABEL_HEADER = "A";
const DEFAULT_IS_LOCATION_ZERO_PAD_ON = true;
const DEFAULT_BLOCKOPTION1 = BLOCKOPTION1_UNITKILL;
const DEFAULT_BLOCKOPTION2 = BLOCKOPTION2_BLOCKREMOVE;
// const DEFAULT_BOMBUNIT1 = UNIT_ZERG_SCOURGE;
// const DEFAULT_BOMBUNIT2 = UNIT_ZERG_OVERLORD;
// const DEFAULT_BOMBUNIT3 = UNIT_TERRAN_BATTLECRUISER;
const DEFAULT_BOMBUNIT1 = UNIT_PROTOSS_PROBE;
const DEFAULT_BOMBUNIT2 = UNIT_TERRAN_WRAITH;
const DEFAULT_BOMBUNIT3 = UNIT_ZERG_ULTRALISK;
const DEFAULT_TURN_WAIT = 42;

// Classes (Modified After Declaration)
var BoundPattern = function(index, label, description, tileset) {
    this.index = __intValue;
    this.label = __strValue;
    this.description = __strValue;
    this.tileset = __strValue;
    this.locationLabelHeader = __strValue;
    this.isLocationZeroPadOn = __booleanValue;
    this.blockOption1 = __intValue;
    this.blockOption2 = __intValue;
    this.bombUnit1 = __strValue;
    this.bombUnit2 = __strValue;
    this.bombUnit3 = __strValue;
    this.currentTurn = __intValue;
    this.tileDataList = __arrValue;
    this.locationList = __arrValue;
    this.turnList = __arrValue;

    this.init = function() {
        this.index = index;
        this.label = label;
        this.description = description;
        this.tileset = tileset;
        this.tileDataList = new Array(); // 포인터 기반 변수들은 명시적으로 별도 지정해주지 않으면, 콘솔 출력 테스트 시 이상한 애 들어가 있어서 어리둥절하는 대재앙 발생...
        this.locationList = new Array();
        this.turnList = new Array();
    };

    this.init();
};

var BoundTurn = function() {
    this.cellList = __arrValue;
    this.wait = __intValue;

    this.init = function() {
        this.cellList = new Array();
    };

    this.init();
};

var BoundTurnCell = function(location, type, unit, option) {
    this.location = __locationValue;
    this.type = __intValue; // 1 : 폭탄 Cell, 2 : 장애물 생성 Cell, 3 : 장애물 삭제 Cell
    this.unit = __strValue;
    this.option = __intValue; // 1 : 유닛 Kill, 2 : 유닛 Remove, 3 : 유닛 생존, 4 : 장애물 Kill, 5: 장애물 Remove

    this.init = function() {
        this.location = location;
        this.type = type;
        this.unit = unit;
        this.option = option;
    };

    this.init();
};

var TileData = function(tile, posX, posY) {
    this.tile = __tileValue;
    this.posX = __intValue;
    this.posY = __intValue;

    this.init = function() {
        this.tile = tile;
        this.posX = posX;
        this.posY = posY;
    };

    this.init();
};

// Declaration Constants

//* Already defined in scmap_api.js *//
// const __intValue = 0;
// const __strValue = "";
// const __imgValue = new Image();
// const __arrValue = [];
// const __2dArrValue = [[]];
// const __objValue = {};
// const __booleanValue = false;

//* Others *//
const __tileValue = new SCTile();
const __locationValue = new SCLocation();
const __patternValue = new BoundPattern();

// the project object
var Project = {
    name : __strValue,
    patterns : __arrValue,
    currentPattern : __patternValue
};