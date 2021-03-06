/*
 * @ name: trigger_handler.js
 * @ version: 0.1.1
 * @ author: joshow
 * @ brief: 폭탄피하기 패턴을 특정 포맷에 맞는 트리거 코드로 변환한다.
 * @ detail
 *   trigger_handler.js는 BoundEditorLS에서 취급하는 BoundPattern 객체를 특정 포맷에 맞는 트리거 코드로 변환시킨다.
 *   SCM Draft 2의 플러그인인 'TE'와 'TE+' 포맷에 맞는 텍스트 코드 변환과 '.scx' 같은 스타크래프트 맵 파일에 직접 트리거 바이너리 코드를 삽입하는 기능 구현까지 목표로 하고 있다.
 *   추가로 BoundEditorLS 내에서 패턴 외의 간단한 트리거 편집 기능 추가도 고려하고 있다.
 *   
 *   0.1.1v - 2020.03.18
 *    - 0.1.1v 은 TE 트리거 변환만 지원한다.
 *    - getPatternTETriggerText()를 호출하여 BoundPattern 객체를 TE 트리거 코드로(String) 반환한다.
 *    - 플레이어는 Player7, 조건은  Switch15와 1 이상의 미네랄로 고정되어있다. 차후 수정될 예정이다.
 *    - TE 에서 취급하는 문자열 상수들이 정의되어 있다.
 *    - TETextCreator 객체를 통해 TE 트리거 함수를 호출하듯 트리거 코드를 작성할 수 있다.
 *    - TE 함수를 호출할 때는 아래와 같은 순서대로 작성해야 올바른 트리거 코드를 얻을 수 있다.
        < Trigger() - Conditions() - {조건들} - Actions() - {액션들} - TriggerEnd() > 
 *    - 또한 conditionLineCount와 actionLineCount가 최대치를 넘지 않도록 유의하여 작성하여야 한다.
 *    - 0.1.1v 에서는 구현하면서 꼭 필요했던 상수들과 함수들만 추가하였으나 그 외의 것이 필요하다면 TE와 동일한 양식으로 추가하면 된다.
 *    - 기본 기능 테스트는 전부 마쳤지만 그 외 많은 테스트를 수행하지 못했기에 문제가 발생할 여지가 있다.
 * 
 *   2020-03-20 수정 (수정자 : `Less)
 *    - var TETextCreator를 trigedit.js로 이동
 *    - TETextCreator -> TrigEdit으로 이름 변경하고, 클래스 방식에서 객체로 변경
 *    - Trigger -> TriggerStart로 이름 변경.
 *    - TriggerHandler 객체 추가. 기존 함수(getPatternTETriggerText)를 TriggerHandler 객체로 넣고, parsePattern으로 이름 변경.
 *    - 분석 실패 시 return undefined; 처리
 *    - 그 외 전반적으로 코드 수정 및 여러 메서드 추가.
*/

const TH_TEXT_LEVEL_KOREAN = "스테이지";
const TH_TEXT_LEVEL_ENGLISH = "Stage";
const TH_TEXT_START_CONDITION = "시작 조건";
const TH_TEXT_UNIT_REVIVE = "유닛 부활";
const TH_TEXT_DEFEAT = "Game Over";
const TH_TEXT_VICTORY = "Victory";
const TH_TEXT_HYPER_TRIGGER = "터보 트리거";
const TH_TEXT_DEFEAT_CONDITION = "패배 조건";
const TH_TEXT_VICTORY_CONDITION = "승리 조건";
const TH_TEXT_P12_KILL = "나간 유닛 삭제";
const TH_TEXT_LIFE_SETTINGS = "목숨 설정";
const TH_TEXT_ALLIANCE_SETTINGS = "동맹 설정";

const TH_TRIGGERTYPE_BOMB = 1;
const TH_TRIGGERTYPE_BLOCKCREATE = 2;
const TH_TRIGGERTYPE_BLOCKDELETE = 3;
const TH_TRIGGERTYPE_WAIT = 4;

const TH_P12_KILL = "Kill";
const TH_P12_REMOVE = "Remove";

const TH_LIFETYPE_LIFE = "Life";
const TH_LIFETYPE_DEATH = "Death";

const TH_EDITORTYPE_TRIGEDIT = "TrigEdit";

const ACTIONCOUNT_LIMIT = 64;

var THTrigger = function(type, contentObj) {
    this.type = type;
    this.contentObj = contentObj;
};

var TriggerHandler = { // 아래의 메서드 순서는, parsePattern을 제외하고 실제 바운드에서 요구하는 트리거 출력 순서에 준함. 함부로 변경하지 말 것.
    // editorType -> TH_EDITORTYPE_TRIGEDIT 참고
    parsePattern : function(editorType, pattern, level, bombPlayer, patternConditionUnit, turnConditionUnit) {}, // 실제 패턴 분석 작업 수행 후 string을 리턴하는 용도
    
    getLifeSettingsTrigger : function(editorType, userForce, userForceName, lifeType, lifeCount) {},
    getP12DeleteTrigger : function(editorType, bombPlayer, deleteMethod) {},
    getDefeatTrigger : function(editorType, userForce, userForceName, boundingUnit) {},
    getVictoryTrigger : function(editorType, userForce, userForceName, conditionLocationLabel) {},
    getAllianceTrigger : function(editorType) {},
    getLevelStartConditionTriggers : function(editorType, patternList, userForce, userForceName, bombPlayer, conditionLocationLabelHeader, patternConditionUnit, turnConditionUnit) {},
    getReviveConditionTriggers : function(editorType, patternList, userForce, userForceName, bombPlayer, conditionLocationLabelHeader, patternConditionUnit, boundingUnit, lifeType) {},
    parsePatternList : function(editorType, patternList, bombPlayer, patternConditionUnit, turnConditionUnit) {}, // 단순히 parsePattern을 여러 번 수행한 후 string을 리턴하는 용도
    getHyperTriggers : function(editorType, conditionUnit) {}
};

// 수정 사항 : level (스테이지), bombPlayer, patternConditionUnit, turnConditionUnit 추가
// Switch -> Deaths로 변경
// 분석 실패 시, return undefined 처리
TriggerHandler.parsePattern = function(editorType, pattern, level, bombPlayer, patternConditionUnit, turnConditionUnit) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.

    if (!pattern) return null; // 패턴 존재 X

    // 로케이션이나 폭탄이 없으면 트리거를 작성하지 않는다.
    var locationList = pattern.locationList;
    var turnList = pattern.turnList;
    if (!locationList || locationList.length === 0) return null;
    if (!turnList || (turnList.length === 1 && turnList[0].cellList.length === 0)) return null;

    if (!isValidBombPlayer(bombPlayer)) {
        Log.error("Invalid Bomb Player");
        return undefined;
    }

    // 2차원으로 얽혀 있는 배열의 다양한 유형의 값들을 하나의 타입(=클래스)으로 묶은 다음 1차원으로 나열
    var triggerList = new Array();
    for (var i = 0; i < turnList.length; i++) {
        for (var j = 0; j < turnList[i].cellList.length; j++) {
            let cell = turnList[i].cellList[j];
            let type;
            
            switch (cell.type) {
                case TURNCELLTYPE_BOMB: type = TH_TRIGGERTYPE_BOMB; break;
                case TURNCELLTYPE_BLOCKCREATE : type = TH_TRIGGERTYPE_BLOCKCREATE; break;
                case TURNCELLTYPE_BLOCKDELETE : type = TH_TRIGGERTYPE_BLOCKDELETE; break;
            }
            
            triggerList.push(new THTrigger(type, cell));
        }
        triggerList.push(new THTrigger(TH_TRIGGERTYPE_WAIT, turnList[i].wait));
    }

    var currentLoop = 0;
    var triggerText = "";
    // 1차원으로 나열한 triggerList 안에 요소가 남아 있는 동안 반복하며, 요소의 내용을 하나 사용 완료할 때마다 배열에서 제거하는 원리
    while (triggerList.length > 0) {
        triggerText += TrigEdit.TriggerStart(bombPlayer);

        triggerText += TrigEdit.Conditions();
        triggerText += TrigEdit.Deaths(bombPlayer, patternConditionUnit, TE_QUANTITYMOD_EXACTLY, level);
        triggerText += TrigEdit.Deaths(bombPlayer, turnConditionUnit, TE_QUANTITYMOD_EXACTLY, currentLoop);

        triggerText += TrigEdit.Actions();
        triggerText += TrigEdit.Comment(TH_TEXT_LEVEL_KOREAN + " " + level + "-" + (currentLoop + 1));

        let actionCount = 1; // Comment 1개
        while (actionCount <= ACTIONCOUNT_LIMIT - 2 - 2) { // 64 - (Set Deaths & PreserveTrigger) - (while문 한 번 당 올라갈 수 있는 최대 actionCount값)
            if (triggerList.length === 0) break;

            let index = 0; // 인덱스는 무조건 0 고정. 가장 첫 번째 요소를 검사하고, 사용을 완료하면 배열에서 제거. 해당 행위를 반복.
            let content = triggerList[index].contentObj; // 웨잇일 경우 int, 그렇지 않을 경우 cell
            switch (triggerList[index].type) {
                case TH_TRIGGERTYPE_BOMB:
                    triggerText += TrigEdit.CreateUnitWithProperties(bombPlayer, content.unit, 1, content.location.label, 3);
                    triggerText += TrigEdit.KillUnitAtLocation(TE_PLAYER_ALL, TE_UNIT_MEN, TE_ALL, content.location.label);
                    actionCount += 2;
                    break;
                case TH_TRIGGERTYPE_BLOCKCREATE:
                    triggerText += TrigEdit.CreateUnitWithProperties(bombPlayer, content.unit, 1, content.location.label, 3);
                    actionCount++;
                    if (content.option === TURNCELLOPTION_UNITKILL) {
                        triggerText += TrigEdit.KillUnitAtLocation(TE_PLAYER_ALL, TE_UNIT_MEN, TE_ALL, content.location.label);
                        actionCount++;
                    }
                    else if (content.option === TURNCELLOPTION_UNITREMOVE) {
                        triggerText += TrigEdit.RemoveUnitAtLocation(TE_PLAYER_ALL, TE_UNIT_MEN, TE_ALL, content.location.label);
                        actionCount++;
                    }
                    break;
                case TH_TRIGGERTYPE_BLOCKDELETE:
                    if (content.option === TURNCELLOPTION_BLOCKKILL) {
                        triggerText += TrigEdit.KillUnitAtLocation(TE_PLAYER_ALL, content.unit, TE_ALL, content.location.label);
                    }
                    else if (content.option === TURNCELLOPTION_BLOCKREMOVE) {
                        triggerText += TrigEdit.RemoveUnitAtLocation(TE_PLAYER_ALL, content.unit, TE_ALL, content.location.label);
                    }
                    actionCount++;
                    break;
                case TH_TRIGGERTYPE_WAIT:
                    triggerText += TrigEdit.Wait(content);
                    actionCount++;
                    break;
                default:
                    Log.error("Invalid THTrigger Type");
                    return undefined;
            }

            triggerList.splice(index, 1); // triggerList 배열에서 'index' 인덱스부터 총 1개의 요소를 배열에서 제거
        }

        if (triggerList.length > 0) {
            triggerText += TrigEdit.SetDeaths(bombPlayer, turnConditionUnit, TE_MODIFY_ADD, 1);
        }
        else {
            triggerText += TrigEdit.SetDeaths(bombPlayer, turnConditionUnit, TE_MODIFY_SET_TO, 0);
        }
        triggerText += TrigEdit.PreserveTrigger();
        triggerText += TrigEdit.TriggerEnd();
        currentLoop++;
    }
    
    Log.debug(":: Trigger Extraction Request ::");
    // Log.debug(triggerText);

    return triggerText;
};

TriggerHandler.getLifeSettingsTrigger = function(editorType, userForce, userForceName, lifeType, lifeCount) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    // NOTE : userForce는 현재는 쓰이지 않지만, 나중에 쓰일 수도 있으므로 그대로 둘 것.

    if (lifeType !== TH_LIFETYPE_LIFE && lifeType !== TH_LIFETYPE_DEATH) {
        Log.error("Invalid Life Type");
        return undefined;
    }

    var scoreText = (lifeType === TH_LIFETYPE_LIFE) ? "\\x007Lives" : "\\x007Deaths";
    if (lifeType === TH_LIFETYPE_DEATH) lifeCount = 0;
    var triggerText = "";

    triggerText += TrigEdit.TriggerStart(userForceName);
    triggerText += TrigEdit.Conditions();
    triggerText += TrigEdit.Always();
    triggerText += TrigEdit.Actions();
    triggerText += TrigEdit.Comment(TH_TEXT_LIFE_SETTINGS);
    triggerText += TrigEdit.LeaderboardPoints(scoreText, TE_SCORETYPE_CUSTOM);
    triggerText += TrigEdit.LeaderboardComputerPlayers(TE_STATE_DISABLE);
    triggerText += TrigEdit.SetScore(userForceName, TE_MODIFY_SET_TO, lifeCount, TE_SCORETYPE_CUSTOM);
    triggerText += TrigEdit.TriggerEnd();

    return triggerText;
};

TriggerHandler.getP12DeleteTrigger = function(editorType, bombPlayer, deleteMethod) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    
    if (deleteMethod !== TH_P12_KILL && deleteMethod !== TH_P12_REMOVE) {
        Log.error("Invalid P12 Delete Method");
        return undefined;
    }

    var triggerText = "";

    triggerText += TrigEdit.TriggerStart(bombPlayer);
    triggerText += TrigEdit.Conditions();
    triggerText += TrigEdit.Command(TE_PLAYER_P12, TE_UNIT_MEN, TE_QUANTITYMOD_AT_LEAST, 1);
    triggerText += TrigEdit.Actions();
    triggerText += TrigEdit.Comment(TH_TEXT_P12_KILL);
    if (deleteMethod === TH_P12_KILL) {
        triggerText += TrigEdit.KillUnit(TE_PLAYER_P12, TE_UNIT_MEN);
    }
    else {
        triggerText += TrigEdit.RemoveUnit(TE_PLAYER_P12, TE_UNIT_MEN);
    }
    triggerText += TrigEdit.PreserveTrigger();
    triggerText += TrigEdit.TriggerEnd();

    return triggerText;
};

TriggerHandler.getDefeatTrigger = function(editorType, userForce, userForceName, boundingUnit) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    // NOTE : userForce는 현재는 쓰이지 않지만, 나중에 쓰일 수도 있으므로 그대로 둘 것.

    var triggerText = "";

    triggerText += TrigEdit.TriggerStart(userForceName);
    triggerText += TrigEdit.Conditions();
    triggerText += TrigEdit.Command(userForceName, boundingUnit, TE_QUANTITYMOD_EXACTLY, 0);
    triggerText += TrigEdit.Score(userForceName, TE_SCORETYPE_CUSTOM, TE_QUANTITYMOD_EXACTLY, 0);
    triggerText += TrigEdit.Actions();
    triggerText += TrigEdit.Comment(TH_TEXT_DEFEAT_CONDITION);
    triggerText += TrigEdit.DisplayTextMessage("\\x006" + TH_TEXT_DEFEAT);
    triggerText += TrigEdit.Defeat();
    triggerText += TrigEdit.TriggerEnd();

    return triggerText;
};

TriggerHandler.getVictoryTrigger = function(editorType, userForce, userForceName, conditionLocationLabel) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    // NOTE : userForce는 현재는 쓰이지 않지만, 나중에 쓰일 수도 있으므로 그대로 둘 것.

    var triggerText = "";

    triggerText += TrigEdit.TriggerStart(userForceName);
    triggerText += TrigEdit.Conditions();
    triggerText += TrigEdit.Bring(userForceName, TE_UNIT_MEN, conditionLocationLabel, TE_QUANTITYMOD_AT_LEAST, 1);
    triggerText += TrigEdit.Actions();
    triggerText += TrigEdit.Comment(TH_TEXT_VICTORY_CONDITION);
    triggerText += TrigEdit.DisplayTextMessage("\\x007" + TH_TEXT_VICTORY);
    triggerText += TrigEdit.Victory();
    triggerText += TrigEdit.TriggerEnd();

    return triggerText;
};

TriggerHandler.getAllianceTrigger = function(editorType) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    
    var triggerText = "";
    
    triggerText += TrigEdit.TriggerStart(TE_PLAYER_ALL);
    triggerText += TrigEdit.Conditions();
    triggerText += TrigEdit.Always();
    triggerText += TrigEdit.Actions();
    triggerText += TrigEdit.Comment(TH_TEXT_ALLIANCE_SETTINGS);
    triggerText += TrigEdit.SetAllianceStatus(TE_PLAYER_ALL, TE_ALLIANCESTATUS_ALLY);
    triggerText += TrigEdit.TriggerEnd();

    return triggerText;
};

TriggerHandler.getLevelStartConditionTriggers = function(editorType, patternList, userForce, userForceName, bombPlayer, conditionLocationLabelHeader, patternConditionUnit, turnConditionUnit) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    // NOTE : userForce는 현재는 쓰이지 않지만, 나중에 쓰일 수도 있으므로 그대로 둘 것.
    
    if (!patternList || patternList.length === 0) return null; // 패턴이 존재하지 않음.

    if (!isValidBombPlayer(bombPlayer)) {
        Log.error("Invalid Bomb Player");
        return undefined;
    }

    var triggerText = "";
    for (var i = 0; i < patternList.length; i++) {
        if (patternList[i] === null) continue;
        let level = i + 1;

        triggerText += TrigEdit.TriggerStart(userForceName);
        triggerText += TrigEdit.Conditions();
        triggerText += TrigEdit.Bring(userForceName, TE_UNIT_MEN, conditionLocationLabelHeader + level, TE_QUANTITYMOD_AT_LEAST, 1);
        triggerText += TrigEdit.Actions();
        triggerText += TrigEdit.Comment(TH_TEXT_LEVEL_KOREAN + " " + level + " " + TH_TEXT_START_CONDITION);
        triggerText += TrigEdit.SetDeaths(bombPlayer, patternConditionUnit, TE_MODIFY_SET_TO, level);
        triggerText += TrigEdit.SetDeaths(bombPlayer, turnConditionUnit, TE_MODIFY_SET_TO, 0);
        triggerText += TrigEdit.DisplayTextMessage("\\x007" + TH_TEXT_LEVEL_ENGLISH + level);
        triggerText += TrigEdit.TriggerEnd();
    }

    return triggerText;
};

TriggerHandler.getReviveConditionTriggers = function(editorType, patternList, userForce, userForceName, bombPlayer, conditionLocationLabelHeader, patternConditionUnit, boundingUnit, lifeType) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    // NOTE : userForce는 현재는 쓰이지 않지만, 나중에 쓰일 수도 있으므로 그대로 둘 것.
    
    if (!patternList || patternList.length === 0) return null; // 패턴이 존재하지 않음.

    if (!isValidBombPlayer(bombPlayer)) {
        Log.error("Invalid Bomb Player");
        return undefined;
    }

    var triggerText = "";
    for (var i = 0; i < patternList.length; i++) {
        if (patternList[i] === null) continue;
        let level = i + 1;

        triggerText += TrigEdit.TriggerStart(userForceName);
        triggerText += TrigEdit.Conditions();
        triggerText += TrigEdit.Deaths(bombPlayer, patternConditionUnit, TE_QUANTITYMOD_EXACTLY, level);
        triggerText += TrigEdit.Command(TE_PLAYER_CURRENT, boundingUnit, TE_QUANTITYMOD_EXACTLY, 0);
        triggerText += TrigEdit.Actions();
        triggerText += TrigEdit.Comment(TH_TEXT_LEVEL_KOREAN + " " + level + " " + TH_TEXT_UNIT_REVIVE);
        triggerText += TrigEdit.CreateUnit(TE_PLAYER_CURRENT, boundingUnit, 1, conditionLocationLabelHeader + level);
        if (lifeType === TH_LIFETYPE_LIFE) {
            // 라이프제인 경우
            triggerText += TrigEdit.SetScore(TE_PLAYER_CURRENT, TE_MODIFY_SUBTRACT, 1, TE_SCORETYPE_CUSTOM);
        }
        else {
            // 무한 목숨인 경우
            triggerText += TrigEdit.SetScore(TE_PLAYER_CURRENT, TE_MODIFY_ADD, 1, TE_SCORETYPE_CUSTOM);
        }
        triggerText += TrigEdit.DisplayTextMessage("\\x006T\\x004ry\\x006A\\x004gain");
        triggerText += TrigEdit.PreserveTrigger();
        triggerText += TrigEdit.TriggerEnd();
    }

    return triggerText;
};

TriggerHandler.parsePatternList = function(editorType, patternList, bombPlayer, patternConditionUnit, turnConditionUnit) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    
    if (!patternList || patternList.length === 0) return null; // 패턴이 존재하지 않음.
    
    var triggerText = "";

    for (var i = 0; i < patternList.length; i++) {
        let pattern = patternList[i];
        let level = i + 1;
        let result = TriggerHandler.parsePattern(editorType, pattern, level, bombPlayer, patternConditionUnit, turnConditionUnit);
        if (!result) continue;
        else triggerText += result;
    }

    return (triggerText === "") ? null : triggerText;
};

TriggerHandler.getHyperTriggers = function(editorType, conditionUnit) {
    // TODO : editorType (에디터 유형)이 추가될 경우, 그에 따른 처리를 추가해야 함.
    
    var triggerText = "";
    
    for (var i = 0; i < 4; i++) {
        triggerText += TrigEdit.TriggerStart(TE_PLAYER_ALL);
        triggerText += TrigEdit.Conditions();
        triggerText += TrigEdit.Always();
        triggerText += TrigEdit.Actions();
        triggerText += TrigEdit.Comment(TH_TEXT_HYPER_TRIGGER);
        for (var j = 0; j < 62; j++) triggerText += TrigEdit.Wait(0);
        triggerText += TrigEdit.PreserveTrigger();
        triggerText += TrigEdit.TriggerEnd();
    }

    return triggerText;
};

var isValidBombPlayer = function(bombPlayer) {
    // 폭탄 트리거용 플레이어 체크
    if (bombPlayer !== TE_PLAYER_P1 &&
        bombPlayer !== TE_PLAYER_P2 &&
        bombPlayer !== TE_PLAYER_P3 &&
        bombPlayer !== TE_PLAYER_P4 &&
        bombPlayer !== TE_PLAYER_P5 &&
        bombPlayer !== TE_PLAYER_P6 &&
        bombPlayer !== TE_PLAYER_P7 &&
        bombPlayer !== TE_PLAYER_P8) {

        return false;
    }

    return true;
};

var isValidUserForce = function(userForce) {
    // 유저의 세력 체크
    if (userForce !== TE_PLAYER_FORCE1 &&
        userForce !== TE_PLAYER_FORCE2 &&
        userForce !== TE_PLAYER_FORCE3 &&
        userForce !== TE_PLAYER_FORCE4) {

        return false;
    }

    return true;
};