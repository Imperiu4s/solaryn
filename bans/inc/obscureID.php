<?php

class ObscureID {
    const BLOCK_SIZE = 3;
    const MINIMUM_OUTPUT_SIZE = (self::BLOCK_SIZE * 2);
    const ERROR = -1;

    private int $shuffleSecret;
    private array $shuffle;
    private array $unshuffle;

    public function __construct($input) {
        $array = explode(":", $input, 2);
        $this->shuffle = array();
        $this->unshuffle = array();

        $this->shuffleSecret = $array[0];
        $this->buildShuffleTables($array[1]);
    }

    public function obscure($input): string {
        try {
            $secret = (int)$input + $this->shuffleSecret;
            $id = (string)$secret;
            $id = $this->leftPadInflate($id);

            $output = "";
            $currentBlock = "";
            $firstBlock = true;
            for ($i = 0, $len = strlen($id); $i < $len; $i++) {
                $currentBlock .= $id[$i];
                if (strlen($currentBlock) >= self::BLOCK_SIZE) {
                    if (!$firstBlock) {
                        if ($currentBlock === "000") {
                            $output .= "m";
                        } else if (strpos($currentBlock, "00") === 0) {
                            $output .= "v";
                        } else if ($currentBlock[0] === "0") {
                            $output .= "z";
                        }
                    }
                    $output .= $this->shuffleIn($currentBlock);
                    $currentBlock = "";
                    $firstBlock = false;
                }
            }
            if (!empty($currentBlock)) {
                throw new RuntimeException();
            }
            return strtoupper($output);
        } catch (RuntimeException $ex) {
            return "error";
        }
    }

    public function reveal($input): int {
        try {
            $str = strtolower($input);
            $output = "";
            $currentBlock = "";
            for ($i = 0, $pad = 0, $len = strlen($str); $i < $len; $i++) {
                switch ($str[$i]) {
                    case 'm':
                        $pad = 3;
                        break;
                    case 'v':
                        $pad = 2;
                        break;
                    case 'z':
                        $pad = 1;
                        break;
                    default:
                        $currentBlock .= $str[$i];
                        break;
                }
                if (strlen($currentBlock) >= self::BLOCK_SIZE) {
                    $output .= $this->shuffleOut($currentBlock, $pad);
                    $currentBlock = "";
                    $pad = 0;
                }
            }
            if (!empty($currentBlock)) {
                throw new RuntimeException();
            }
            return (int)$output - $this->shuffleSecret;
        } catch (RuntimeException $ex) {
            return self::ERROR;
        }
    }

    private function leftPadInflate($id): string {
        $pad = strlen($id) % self::BLOCK_SIZE;
        switch ($pad) {
            case 1:
                return "00$id";
            case 2:
                return "0$id";
            default:
                return $id;
        }
    }

    private function leftPadDeflate($pad, $result): string {
        switch ($pad) {
            case 0:
                return (string)$result;
            case 1:
                return "0$result";
            case 2:
                return "00$result";
            case 3:
                return "000";
            default:
                throw new RuntimeException();
        }
    }

    private function buildShuffleTables($str) {
        for ($i = 0; $i <= 999; $i++) {
            $idx = (int)($i * 3);
            $hex = substr($str, $idx, 3);
            $this->shuffle[$i] = $hex;
            $this->unshuffle[$hex] = $i;
        }
    }

    private function shuffleIn($currentBlock): string {
        if (isset($this->shuffle[(int)$currentBlock])) {
            return $this->shuffle[(int)$currentBlock];
        }
        throw new RuntimeException("No shuffle input for $currentBlock");
    }

    private function shuffleOut($currentBlock, $pad): string {
        if (isset($this->unshuffle[$currentBlock])) {
            return $this->leftPadDeflate($pad, $this->unshuffle[$currentBlock]);
        }
        throw new RuntimeException("No shuffle output for $currentBlock");
    }
}
