from app.game import apply_move, best_move, empty_board, evaluate


def test_empty_board_is_not_over():
    status = evaluate(empty_board())
    assert status.winner is None
    assert not status.is_draw
    assert not status.is_over


def test_row_win():
    board = ["X", "X", "X", "", "O", "", "", "O", ""]
    status = evaluate(board)
    assert status.winner == "X"
    assert status.line == (0, 1, 2)


def test_diagonal_win():
    board = ["O", "X", "X", "", "O", "", "", "X", "O"]
    status = evaluate(board)
    assert status.winner == "O"
    assert status.line == (0, 4, 8)


def test_draw():
    board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"]
    status = evaluate(board)
    assert status.winner is None
    assert status.is_draw


def test_apply_move_validation():
    board = empty_board()
    new_board = apply_move(board, 4, "X")
    assert new_board[4] == "X"
    # original is untouched
    assert board[4] == ""


def test_ai_blocks_immediate_loss():
    # X threatens to win the left column (0, 3, 6); O must block at index 3.
    board = [
        "X", "",  "O",
        "",  "",  "",
        "X", "",  "",
    ]
    assert best_move(board, "O") == 3


def test_ai_takes_winning_move():
    # O can win by playing index 5 (middle row).
    board = [
        "X", "X", "",
        "O", "O", "",
        "",  "",  "X",
    ]
    assert best_move(board, "O") == 5


def test_ai_never_loses_starting_first():
    # Self-play: optimal vs optimal should always end in a draw.
    board = empty_board()
    player = "X"
    while not evaluate(board).is_over:
        idx = best_move(board, player)
        board = apply_move(board, idx, player)
        player = "O" if player == "X" else "X"
    assert evaluate(board).is_draw
