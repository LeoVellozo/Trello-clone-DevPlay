<?php

try {
    
    $result = array();
        
    if (empty($_REQUEST["type"])){
        
        $result['success'] = false;
        $result['msg']     = "Falta uma parâmetro na requisição.";
        
    } else {

        $username = "root";
        $password = "";

        $pdo = new PDO("mysql:host=localhost;dbname=trello_clone", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        switch($_REQUEST["type"]){
            
            case "create_board":

                try {

                    $getMaxTaskOrder = $pdo->query("SELECT MAX(board_order) max_board_order, MAX(id) max_id FROM `boards`")->fetch();
                    $maxId = (int) $getMaxTaskOrder['max_id'] + 1;
                    $maxOrder = (int) $getMaxTaskOrder['max_board_order'] + 1;
                    $boardRef = "_newboard$maxId";
                    $boardTitle = "(Novo Board)";
                    $class = "default";

                    $stmt = $pdo->prepare('INSERT INTO boards (ref, title, class, board_order) VALUES(:ref, :title, :class,  :board_order)');
                    $stmt->execute([
                        'ref' => $boardRef,
                        'title' => $boardTitle,
                        'class' => $class,
                        'board_order' => $maxOrder,
                    ]);

                    $getId = $pdo->query("SELECT id FROM boards WHERE ref = '$boardRef'")->fetch();

                    $result['board_id'] = (int) $getId['id'];
                    $result['board_title'] = $boardTitle;

                } catch (\PDOException $e) {
                    $result['success'] = false;
                    $result['msg']     = "Houve um erro ao tentar salvar a informação no banco de dados";
                    $result['err']     = $e->getMessage();
                }

            break;

            case "read_boards":

                $getBoards = $pdo->query("SELECT * FROM `boards` ORDER BY board_order ASC;");
                $boards = [];
                
                while ($row = $getBoards->fetch(PDO::FETCH_ASSOC)) {
                    array_push($boards, $row);
                }
                
                $result = $boards;

            break;

            case "update_board":
            break;

            case "delete_board":
            break;

        }
        
    }

    header("Content-Type: application/json;");
    echo json_encode($result);

} catch(\Exception $e){
    $result['success'] = false;
    $result['msg']     = "Houve um erro generalizado";
    $result['err']     = $e->getMessage();
}