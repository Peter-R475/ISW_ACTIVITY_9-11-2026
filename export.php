<?php
session_start();
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;


$headers = [];
$formattedRows = [];

// ==========================================
// ROUTE 1: Handle Format A (from $_GET['export'])
// ==========================================
if (isset($_GET['export']) && $_GET['export'] == '1' && isset($_SESSION['EXPORT_DATA'])) {

    $exportData = $_SESSION['EXPORT_DATA'];
    $activityTitle = $exportData['activityTitle'] ?? 'export';
    $filteredData = $exportData['filteredData'] ?? [];

    if (!is_array($filteredData) || empty($filteredData)) {
        http_response_code(400);
        echo "Error: Invalid or empty dataset provided for export.";
        exit();
    }

    // Initialize array variables explicitly
    $headers = [];
    $rawRows = [];
    $formattedRows = [];

    // 1. Extract headers dynamically and parse nested 'Data' array
    foreach ($filteredData as $item) {
        $row = [];

        // Include base keys if present
        if (isset($item['ID'])) {
            $row['ID'] = $item['ID'];
            if (!in_array('ID', $headers, true)) {
                $headers[] = 'ID';
            }
        }

        // Parse inner dynamic fields
        if (isset($item['Data'])) {
            $innerData = is_array($item['Data']) ? $item['Data'] : json_decode($item['Data'], true);
            if (is_array($innerData)) {
                foreach ($innerData as $field) {
                    if (isset($field['name'], $field['value'])) {
                        $name = $field['name'];
                        $value = $field['value'];

                        if (!in_array($name, $headers, true)) {
                            $headers[] = $name;
                        }
                        $row[$name] = $value;
                    }
                }
            }
        }

        if (isset($item['Date'])) {
            $row['Date'] = $item['Date'];
            if (!in_array('Date', $headers, true)) {
                $headers[] = 'Date';
            }
        }

        $rawRows[] = $row;
    }

    // 2. Align each row strictly to order of discovered headers
    foreach ($rawRows as $row) {
        $orderedRow = [];
        foreach ($headers as $header) {
            $orderedRow[] = $row[$header] ?? '';
        }
        $formattedRows[] = $orderedRow;
    }

    $safeTitle = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $activityTitle);
    $fileName = $safeTitle . '_' . date('Y-m-d_H-i-s') . '.xlsx';






}
// ==========================================
// ROUTE 2: Handle Format B (from $_POST['export_text'])
// ==========================================
elseif (isset($_GET['exportTitleParam']) && isset($_GET['exportFilteredDataParam'])) {

    // PHP automatically decodes $_GET values; manual urldecode() causes double-decoding bugs
    $activityTitle = $_GET['exportTitleParam'];
    $rawJson = $_GET['exportFilteredDataParam'];
    $filteredData = json_decode($rawJson, true);

    if (!is_array($filteredData)) {
        http_response_code(400);
        echo "Error: Invalid JSON structure provided in exportFilteredDataParam.";
        exit();
    }

    // Table headers including overall average
    $headers = ['Title', 'Very Bad', 'Bad', 'Average', 'Good', 'Excellent', 'Average Satisfaction'];

    $formattedRows = [];
    foreach ($filteredData as $item) {
        if (!isset($item['Title'])) {
            continue;
        }

        $title = $item['Title'];
        $scores = $item['Scores'] ?? [];
        $avg = isset($item['Average']) ? number_format((float) $item['Average'], 2) : '0.00';

        $formattedRows[] = [
            $title,
            $scores['Very Bad'] ?? '0',
            $scores['Bad'] ?? '0',
            $scores['Average'] ?? '0',
            $scores['Good'] ?? '0',
            $scores['Excellent'] ?? '0',
            $avg
        ];
    }

    // Fix: Use $activityTitle variable instead of literal string '$activity_summary'
    $cleanTitle = !empty($activityTitle) ? $activityTitle : 'activity_summary';
    $safeTitle = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $cleanTitle);
    $fileName = $safeTitle . '_' . date('Y-m-d_H-i-s') . '.xlsx';

} else {
    http_response_code(400);
    echo "Error: Missing required query parameters.";
    exit();
}


// ==========================================
// ICD
// ==========================================
if (isset($_GET['export']) && $_GET['export'] == '1' && isset($_SESSION['EXPORT_DATA']) && $_SESSION['Dept'] == 'ICD') {

    $exportData = $_SESSION['EXPORT_DATA'];
    $activityTitle = $exportData['activityTitle'] ?? 'export';
    $filteredData = $exportData['filteredData'] ?? [];

    if (!is_array($filteredData) || empty($filteredData)) {
        http_response_code(400);
        echo "Error: Invalid or empty dataset provided for export.";
        exit();
    }

    // Step 1: Detect duplicate Student_IDs
    $studentIds = [];
    foreach ($filteredData as $item) {
        $id = trim((string) ($item['Student_ID'] ?? $item['ID'] ?? ''));
        $studentIds[] = ($id !== '') ? strtolower($id) : null;
    }

    $validIds = array_filter($studentIds, fn($id) => $id !== null);
    $idCounts = array_count_values($validIds);

    // Step 2: Collect unique dynamic fields (General first, then dynamic GLO keys)
    $generalFields = [];
    $gloFields = [];

    foreach ($filteredData as $item) {
        $innerData = is_array($item['Data'] ?? null) ? $item['Data'] : json_decode($item['Data'] ?? '{}', true);
        if (!is_array($innerData)) {
            continue;
        }

        // General fields
        if (isset($innerData['General']) && is_array($innerData['General'])) {
            foreach ($innerData['General'] as $entry) {
                $fieldName = $entry['name'] ?? $entry['label'] ?? '';
                if ($fieldName !== '' && !in_array($fieldName, $generalFields, true)) {
                    $generalFields[] = $fieldName;
                }
            }
        }

        // Dynamic GLO keys
        foreach ($innerData as $groupKey => $entries) {
            if (str_starts_with($groupKey, 'GLO') && is_array($entries)) {
                if (!isset($gloFields[$groupKey])) {
                    $gloFields[$groupKey] = [];
                }
                foreach ($entries as $entry) {
                    $fieldName = $entry['name'] ?? $entry['label'] ?? '';
                    if ($fieldName !== '' && !in_array($fieldName, $gloFields[$groupKey], true)) {
                        $gloFields[$groupKey][] = $fieldName;
                    }
                }
            }
        }
    }

    // Step 3: Build deterministic headers
    $headers = ['ID', 'Student_ID'];

    foreach ($generalFields as $field) {
        $headers[] = "General: {$field}";
    }

    foreach ($gloFields as $gloGroup => $questions) {
        foreach ($questions as $q) {
            $headers[] = "{$gloGroup} ({$q} Before)";
            $headers[] = "{$gloGroup} ({$q} After)";
        }
    }

    $headers[] = 'Date';

    // Step 4: Build rows with duplicate styling metadata
    $formattedRows = [];

    foreach ($filteredData as $index => $item) {
        $innerData = is_array($item['Data'] ?? null) ? $item['Data'] : json_decode($item['Data'] ?? '{}', true);
        $innerData = is_array($innerData) ? $innerData : [];

        // Fast lookup map
        $mappedData = [];
        foreach ($innerData as $groupKey => $entries) {
            if (is_array($entries)) {
                foreach ($entries as $entry) {
                    $name = $entry['name'] ?? $entry['label'] ?? '';
                    if ($name !== '') {
                        $mappedData[$groupKey][$name] = $entry;
                    }
                }
            }
        }

        $rowCells = [];
        $rowCells[] = $item['ID'] ?? '';
        $rowCells[] = $item['Student_ID'] ?? '';

        // General values
        foreach ($generalFields as $field) {
            $rowCells[] = $mappedData['General'][$field]['value'] ?? '';
        }

        // GLO values (Before & After)
        foreach ($gloFields as $gloGroup => $questions) {
            foreach ($questions as $q) {
                $rowCells[] = $mappedData[$gloGroup][$q]['value_before'] ?? '';
                $rowCells[] = $mappedData[$gloGroup][$q]['value_after'] ?? '';
            }
        }

        $rowCells[] = $item['Date'] ?? '';

        // Determine if duplicate
        $currentId = $studentIds[$index];
        $isDuplicate = $currentId !== null && ($idCounts[$currentId] ?? 0) > 1;

        $formattedRows[] = [
            'data' => $rowCells,
            'is_duplicate' => $isDuplicate,
            'bg_color' => $isDuplicate ? 'FFCDD2' : null // Soft red hex (no # for Excel libraries)
        ];
    }

    $safeTitle = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $activityTitle);
    $fileName = $safeTitle . '_' . date('Y-m-d_H-i-s') . '.xlsx';
}

// ==========================================
// SPREADSHEET GENERATION & DOWNLOAD
// ==========================================

use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Write headers starting at Row 1
if (!empty($headers)) {
    $sheet->fromArray($headers, null, 'A1');
}

// Calculate the last column letter dynamically (e.g., 'Z', 'AA', etc.)
$lastColIndex = count($headers);
$lastColLetter = Coordinate::stringFromColumnIndex($lastColIndex);

// Write data rows starting at Row 2 and apply duplicate styling
$currentRow = 2;
foreach ($formattedRows as $rowItem) {
    // 1. Write the cell data array
    $sheet->fromArray($rowItem['data'], null, "A{$currentRow}");

    // 2. Apply red background color if the row is marked as duplicate
    if (!empty($rowItem['is_duplicate'])) {
        $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")
            ->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()
            ->setARGB('FFFFCDD2'); // Light red hex in ARGB format
    }

    $currentRow++;
}

// Clean output buffer to prevent corrupted .xlsx files
if (ob_get_length()) {
    ob_end_clean();
}

// Send response headers for browser download
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="' . $fileName . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit();