<?php
session_start();

// Initialize output variables
$activityTitle = $_POST['activityTitle'] ?? $_SESSION['activityTitle'] ?? 'N/A';
$rawData = $_POST['filteredData'] ?? $_SESSION['filteredData'] ?? null;
$dept = $_SESSION['Dept'] ?? '';
$tableHeadersHTML = '';
$tableRowsHTML = '';
$exportUrl = '#';

/**
 * Helper: Processes standard Format A (ISW / Session replay) datasets
 */
function processFormatA(string $title, ?string $rawJson): array
{
    $filteredData = json_decode($rawJson ?? '[]', true);
    if (!is_array($filteredData)) {
        $filteredData = [];
    }
    $filteredData = array_values($filteredData);

    // Pass 1: Collect unique table header names
    $headerFields = [];
    foreach ($filteredData as $student) {
        $fields = json_decode($student['Data'] ?? '[]', true);
        if (is_array($fields)) {
            foreach ($fields as $f) {
                if (isset($f['name']) && !in_array($f['name'], $headerFields, true)) {
                    $headerFields[] = $f['name'];
                }
            }
        }
    }

    // Build Table Headers
    $headersHTML = '<th>ID</th>';
    foreach ($headerFields as $fieldName) {
        $name = htmlspecialchars($fieldName, ENT_QUOTES, 'UTF-8');
        $headersHTML .= "<th>{$name}</th>";
    }
    $headersHTML .= '<th>Date</th><th>Actions</th>';

    // Pass 2: Extract student IDs for duplicate detection
    $studentIds = [];
    foreach ($filteredData as $student) {
        $dynamicFields = json_decode($student['Data'] ?? '[]', true);
        $fieldMap = is_array($dynamicFields) ? array_column($dynamicFields, 'value', 'name') : [];
        $studentId = trim($fieldMap['student_id'] ?? $fieldMap['studentId'] ?? $student['ID'] ?? '');

        $studentIds[] = ($studentId !== '') ? strtolower($studentId) : null;
    }

    $validIds = array_filter($studentIds, fn($id) => $id !== null);
    $idCounts = array_count_values($validIds);

    // Pass 3: Build HTML rows
    $rowsHTML = '';
    foreach ($filteredData as $index => $student) {
        $dynamicFields = json_decode($student['Data'] ?? '[]', true);
        $fieldValueMap = is_array($dynamicFields) ? array_column($dynamicFields, 'value', 'name') : [];

        $currentId = $studentIds[$index];
        $isDuplicate = $currentId !== null && ($idCounts[$currentId] ?? 0) > 1;
        $rowStyle = $isDuplicate ? 'style="background-color: #ffcdd2;"' : '';

        $dynamicCells = '';
        foreach ($headerFields as $fieldName) {
            $value = htmlspecialchars($fieldValueMap[$fieldName] ?? '', ENT_QUOTES, 'UTF-8');
            $dynamicCells .= "<td style=\"padding: 8px; border: 1px solid #ccc;\">{$value}</td>";
        }

        $id = htmlspecialchars($student['ID'] ?? '', ENT_QUOTES, 'UTF-8');
        $date = htmlspecialchars($student['Date'] ?? '', ENT_QUOTES, 'UTF-8');

        $actionsHTML = '';
        if ($isDuplicate) {
            $actionsHTML = '
            <form method="POST" action="delete.php" style="margin:0;">
                <input type="hidden" name="row_index" value="' . $index . '">
                <input type="hidden" name="id" value="' . $id . '">
                <button type="submit" onclick="return confirm(\'Delete this duplicate record?\');" 
                        style="background-color: #d32f2f; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px;">
                    Delete
                </button>
            </form>';
        }

        $rowsHTML .= "
        <tr {$rowStyle}>
            <td style=\"padding: 8px; border: 1px solid #ccc;\">{$id}</td>
            {$dynamicCells}
            <td style=\"padding: 8px; border: 1px solid #ccc;\">{$date}</td>
            <td style=\"padding: 8px; border: 1px solid #ccc; text-align: center;\">{$actionsHTML}</td>
        </tr>";
    }

    $_SESSION['EXPORT_DATA'] = [
        'activityTitle' => $title,
        'filteredData' => $filteredData
    ];

    return [$headersHTML, $rowsHTML, 'export.php?export=1'];
}

// -------------------------------------------------------------
// Request Routing
// -------------------------------------------------------------

if (isset($_POST['activityTitle'], $_POST['filteredData'])) {
    $activityTitle = $_POST['activityTitle'] ?? 'Untitled Activity';
    $rawData = $_POST['filteredData'];
    $_SESSION['LOG'] = $rawData;

    // Detect format: ICD format contains "General" or "GLO" keys inside "Data"
    $isIcdFormat = ($dept === 'ICD') || ($dept === 'admin' && (str_contains($rawData, 'GLO') || str_contains($rawData, '"General"')));

    if ($isIcdFormat) {
        // =========================================================
        // Process Format B: ICD (General + GLO)
        // =========================================================
        $filteredData = json_decode($rawData, true);
        if (!is_array($filteredData)) {
            $filteredData = [];
        }
        $filteredData = array_values($filteredData);

        // Pass 1: Extract unique general and GLO keys
        $generalFields = [];
        $gloFields = [];

        foreach ($filteredData as $student) {
            $data = json_decode($student['Data'] ?? '{}', true);
            if (!is_array($data)) {
                continue;
            }

            if (isset($data['General']) && is_array($data['General'])) {
                foreach ($data['General'] as $item) {
                    $fieldName = $item['name'] ?? $item['label'] ?? '';
                    if ($fieldName !== '' && !in_array($fieldName, $generalFields, true)) {
                        $generalFields[] = $fieldName;
                    }
                }
            }

            foreach ($data as $groupKey => $items) {
                if (str_starts_with($groupKey, 'GLO') && is_array($items)) {
                    if (!isset($gloFields[$groupKey])) {
                        $gloFields[$groupKey] = [];
                    }
                    foreach ($items as $item) {
                        $fieldName = $item['name'] ?? $item['label'] ?? '';
                        if ($fieldName !== '' && !in_array($fieldName, $gloFields[$groupKey], true)) {
                            $gloFields[$groupKey][] = $fieldName;
                        }
                    }
                }
            }
        }

        // Build Table Headers
        $tableHeadersHTML = '<th>ID</th><th>Student ID</th>';
        foreach ($generalFields as $field) {
            $label = htmlspecialchars($field, ENT_QUOTES, 'UTF-8');
            $tableHeadersHTML .= "<th>General: {$label}</th>";
        }
        foreach ($gloFields as $gloGroup => $questions) {
            $groupLabel = htmlspecialchars($gloGroup, ENT_QUOTES, 'UTF-8');
            foreach ($questions as $q) {
                $qLabel = htmlspecialchars($q, ENT_QUOTES, 'UTF-8');
                $tableHeadersHTML .= "<th>{$groupLabel} ({$qLabel} Before)</th>";
                $tableHeadersHTML .= "<th>{$groupLabel} ({$qLabel} After)</th>";
            }
        }
        $tableHeadersHTML .= '<th>Date</th><th>Actions</th>';

        // Pass 2: Duplicate tracking
        $studentIds = [];
        foreach ($filteredData as $student) {
            $studentId = trim((string) ($student['Student_ID'] ?? $student['ID'] ?? ''));
            $studentIds[] = ($studentId !== '') ? strtolower($studentId) : null;
        }
        $validIds = array_filter($studentIds, fn($id) => $id !== null);
        $idCounts = array_count_values($validIds);

        // Pass 3: Build rows
        $tableRowsHTML = '';
        foreach ($filteredData as $index => $student) {
            $data = json_decode($student['Data'] ?? '{}', true);
            $data = is_array($data) ? $data : [];

            $mappedData = [];
            foreach ($data as $groupKey => $items) {
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $name = $item['name'] ?? $item['label'] ?? '';
                        if ($name !== '') {
                            $mappedData[$groupKey][$name] = $item;
                        }
                    }
                }
            }

            $dynamicCells = '';
            foreach ($generalFields as $field) {
                $val = $mappedData['General'][$field]['value'] ?? '';
                $dynamicCells .= "<td style=\"padding: 8px; border: 1px solid #ccc;\">" . htmlspecialchars((string) $val, ENT_QUOTES, 'UTF-8') . "</td>";
            }

            foreach ($gloFields as $gloGroup => $questions) {
                foreach ($questions as $q) {
                    $valBefore = htmlspecialchars((string) ($mappedData[$gloGroup][$q]['value_before'] ?? ''), ENT_QUOTES, 'UTF-8');
                    $valAfter = htmlspecialchars((string) ($mappedData[$gloGroup][$q]['value_after'] ?? ''), ENT_QUOTES, 'UTF-8');
                    $dynamicCells .= "<td style=\"padding: 8px; border: 1px solid #ccc;\">{$valBefore}</td>";
                    $dynamicCells .= "<td style=\"padding: 8px; border: 1px solid #ccc;\">{$valAfter}</td>";
                }
            }

            $currentId = $studentIds[$index];
            $isDuplicate = $currentId !== null && ($idCounts[$currentId] ?? 0) > 1;
            $rowStyle = $isDuplicate ? 'style="background-color: #ffcdd2;"' : '';

            $id = htmlspecialchars((string) ($student['ID'] ?? ''), ENT_QUOTES, 'UTF-8');
            $student_id_display = htmlspecialchars((string) ($student['Student_ID'] ?? ''), ENT_QUOTES, 'UTF-8');
            $date = htmlspecialchars((string) ($student['Date'] ?? ''), ENT_QUOTES, 'UTF-8');

            $actionsHTML = '';
            if ($isDuplicate) {
                $actionsHTML = '
                <form method="POST" action="delete.php" style="margin:0;">
                    <input type="hidden" name="row_index" value="' . $index . '">
                    <input type="hidden" name="id" value="' . $id . '">
                    <button type="submit" onclick="return confirm(\'Delete this duplicate record?\');" 
                            style="background-color: #d32f2f; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px;">
                        Delete
                    </button>
                </form>';
            }

            $tableRowsHTML .= "
            <tr {$rowStyle}>
                <td style=\"padding: 8px; border: 1px solid #ccc;\">{$id}</td>
                <td style=\"padding: 8px; border: 1px solid #ccc;\">{$student_id_display}</td>
                {$dynamicCells}
                <td style=\"padding: 8px; border: 1px solid #ccc;\">{$date}</td>
                <td style=\"padding: 8px; border: 1px solid #ccc; text-align: center;\">{$actionsHTML}</td>
            </tr>";
        }

        $_SESSION['EXPORT_DATA'] = [
            'activityTitle' => $activityTitle,
            'filteredData' => $filteredData
        ];
        $exportUrl = "export.php?export=1";

    } else {
        // =========================================================
        // Process Format A: ISW (Standard flat structure)
        // =========================================================
        [$tableHeadersHTML, $tableRowsHTML, $exportUrl] = processFormatA($activityTitle, $rawData);
    }

} elseif (isset($_POST['export_text'])) {
    // ... [keep export_text block as is] ...

} elseif (!empty($activityTitle) && !empty($rawData) && $activityTitle !== 'N/A') {
    unset($_SESSION['activityTitle'], $_SESSION['filteredData']);
    [$tableHeadersHTML, $tableRowsHTML, $exportUrl] = processFormatA($activityTitle, $rawData);
}